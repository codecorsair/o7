#!/bin/bash

until wget -q --spider http://localhost:7474; do
  >&2 echo "Waiting for Neo4j to start up..."
  sleep 1
done
