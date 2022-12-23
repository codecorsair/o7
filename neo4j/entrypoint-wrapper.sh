#!/bin/bash

# turn on bash's job control
set -m

echo Start the primary process and put it in the background
/startup/docker-entrypoint.sh neo4j &

echo Wait for the primary process to start up
/wait-for-neo4j.sh

echo Start the helper process

cypher-shell -u neo4j -p neo4j -f /init.cypher

if [ $? -ne 0 ]; then
  echo "Error: cypher-shell failed"
  exit 1
fi

# the my_helper_process might need to know how to wait on the
# primary process to start before it does its work and returns


echo return to the primary process
fg %1