#!/bin/bash

echo "Waiting for Neo4j to start up..."
until wget -q --spider http://localhost:7474; do
  >&2 echo "Neo4j is unavailable - sleeping"
  sleep 1
done