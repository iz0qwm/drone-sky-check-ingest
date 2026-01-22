# Drone Sky Check – Traffic Ingest

Open ingest interface for UAS / Remote ID / SDR-based drone traffic feeders.

This repository documents how external hardware or software systems can feed
drone traffic data into **Drone Sky Check**, a safety-oriented situational
awareness platform.

https://droneskycheck-d0136.web.app/
https://apps.apple.com/it/app/drone-sky-check/id6757807678

---

## What this is

- Open HTTPS ingest endpoint
- Designed for Remote ID receivers, SDR systems and research projects
- Non-commercial
- Safety and awareness oriented
- Italy-based testbed, open to external contributors

This is **not** a tracking or enforcement system.
Data is short-lived and intended for real-time awareness only.

---

## Who this is for

- Remote ID hardware manufacturers
- SDR-based drone receiver builders
- UAS traffic and U-Space researchers
- Developers experimenting with OpenDroneID or custom protocols

---

## Ingest overview

Data is sent via **HTTP POST** using JSON payloads.

Each traffic object is identified by:
- a `source` (the feeder name)
- an `objectId` (unique inside that feeder)

Authentication is currently **feeder-based** (by `source`).
This is intentional and will evolve in later stages.

---

## Payload format

Minimal example:

```json
{
  "source": "example_feeder",
  "objectId": "abc123",
  "type": "drone",
  "lat": 41.9028,
  "lon": 12.4964,
  "altitude": 120,
  "speed": 12.5,
  "heading": 270,
  "model": "Custom RemoteID"
}
```

### Required fields
- `source`
- `objectId`
- `lat`
- `lon`

### Optional fields
- `altitude` (meters)
- `speed` (m/s)
- `heading` (degrees)
- `model` (string)

---

## Validation rules

To avoid noise and non-UAS data, basic plausibility checks are applied:
- invalid coordinates are rejected
- sentinel BLE values (e.g. speed = 255) are rejected
- at least one aeronautical attribute must be present

Invalid payloads are **silently dropped** to keep the dataset clean.

---

## Examples

See the `examples/` folder for:
- curl example
- JSON payload example

---

## Reference implementation

A reference ingest function is provided in:

```
ingest/ingestTrafficObject.js
```

This implementation is meant as:
- documentation
- integration reference
- discussion baseline

It is **not** a drop-in production requirement.

---

## Documentation & context

Full project context, vision and integration notes:

https://tuttosuidroni.it/droneskycheck-developers

---

## License

MIT License
