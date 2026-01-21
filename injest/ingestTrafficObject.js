/**
 * Reference ingest endpoint for Drone Sky Check
 *
 * This file is provided as documentation and example only.
 * Authentication and authorization will evolve in future stages.
 */

import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import admin from "firebase-admin";

// Initialize Firebase Admin (once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

// Allowed feeder identifiers (example-based)
const ALLOWED_SOURCES = new Set([
  "simulator",
  "example_feeder",
  "remoteid_device"
]);

/**
 * Basic plausibility filter to avoid non-UAS noise
 */
function isValidUasPayload(d) {
  // Valid coordinates
  if (
    !Number.isFinite(d.lat) ||
    !Number.isFinite(d.lon) ||
    (d.lat === 0 && d.lon === 0)
  ) return false;

  // Sentinel values often seen in BLE noise
  if (Number.isFinite(d.speed) && d.speed >= 200) return false;

  // At least one aeronautical signal must be present
  const hasAviationSignal =
    Number.isFinite(d.altitude) ||
    Number.isFinite(d.heading) ||
    (typeof d.model === "string" && d.model.length > 0);

  return hasAviationSignal;
}

export const ingestTrafficObject = onRequest(
  {
    cors: true,
    timeoutSeconds: 10,
    memory: "256MiB"
  },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
      }

      const {
        source,
        objectId,
        type = "drone",
        lat,
        lon,
        altitude = null,
        speed = null,
        heading = null,
        model = null
      } = req.body || {};

      // Feeder identification
      if (!ALLOWED_SOURCES.has(source)) {
        return res.status(403).json({
          error: "Source not allowed",
          source
        });
      }

      // Mandatory fields
      if (
        !source ||
        !objectId ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
      ) {
        return res.status(400).json({
          error: "Invalid payload",
          required: ["source", "objectId", "lat", "lon"]
        });
      }

      // Plausibility filtering
      if (!isValidUasPayload({ lat, lon, altitude, speed, heading, model })) {
        return res.status(202).json({
          ok: false,
          dropped: true,
          reason: "non-uas-payload"
        });
      }

      const now = Date.now();
      const docId = `${source}:${objectId}`;
      const expiresAt = new Date(now + 24 * 60 * 60 * 1000); // 24h TTL

      const objRef = db.collection("air_traffic_objects").doc(docId);

      // Upsert traffic object
      await objRef.set(
        {
          source,
          objectId,
          type,
          model,
          lat,
          lon,
          altitude,
          speed,
          heading,
          lastSeen: now,
          expiresAt,
          status: "active",
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      // Append trajectory point
      await objRef.collection("points").add({
        lat,
        lon,
        altitude,
        heading,
        speed,
        timestamp: now
      });

      return res.json({
        ok: true,
        id: docId,
        lastSeen: now
      });
    } catch (err) {
      console.error("[ingestTrafficObject] error:", err);
      return res.status(500).json({ error: "Internal error" });
    }
  }
);
