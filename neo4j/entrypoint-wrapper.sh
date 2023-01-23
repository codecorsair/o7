#!/bin/bash

set -m

if [ ! -f "/data/.initialized" ]; then
  echo "Initializing Database"
  /init.sh &
fi

/startup/docker-entrypoint.sh neo4j
