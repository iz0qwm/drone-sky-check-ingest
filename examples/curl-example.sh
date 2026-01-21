#!/bin/bash

# Example curl request to Drone Sky Check ingest endpoint
# Replace <INGEST_URL> with the actual endpoint URL

curl -X POST <INGEST_URL> \
  -H "Content-Type: application/json" \
  -d '{
    "source": "example_feeder",
    "objectId": "test-001",
    "type": "drone",
    "lat": 41.9028,
    "lon": 12.4964,
    "altitude": 100,
    "speed": 10,
    "heading": 180,
    "model": "Example RemoteID"
  }'
