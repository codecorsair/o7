#!/bin/bash

set -m

if [ ! -f "/data/.initialized" ]; then
  echo "Initializing Database"
  /init.sh &
fi

tini -g -- /startup/docker-entrypoint.sh neo4j
