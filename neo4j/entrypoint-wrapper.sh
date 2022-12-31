#!/bin/bash

set -m
echo "Starting Neo4j..."
/startup/docker-entrypoint.sh neo4j &

if [ ! -f "/data/.initialized" ]; then
  /wait-for-neo4j.sh
  echo "Initializing database..."

  cypher-shell -f /init.cypher

  if [ $? -ne 0 ]; then
    echo "Error: cypher-shell failed"
    exit 1
  fi

  touch /data/.initialized

  echo "Database initialized"
fi

fg %1
