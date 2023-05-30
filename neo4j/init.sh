#!/bin/bash
/usr/src/app/wait-for-neo4j.sh
echo "Initializing database..."

cypher-shell -f /usr/src/app/init.cypher

if [ $? -ne 0 ]; then
  echo "Error: cypher-shell failed"
  exit 1
fi

touch /data/.initialized

echo "Database initialized"