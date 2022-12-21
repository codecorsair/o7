#!/bin/bash

load()
{
    echo "Loading data"
    neo4j-admin database import full --overwrite-destination --nodes=/var/lib/neo4j/import/planetary-production.csv
    neo4j-admin database import full --overwrite-destination --nodes=/var/lib/neo4j/import/systems.csv
}

load