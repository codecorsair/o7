FROM neo4j:latest

WORKDIR /

COPY init.sh /init.sh
RUN chmod +x /init.sh

ENV EXTENSION_SCRIPT=/init.sh

COPY ./planetary-production.csv /var/lib/neo4j/import/planetary-production.csv
COPY ./systems.csv /var/lib/neo4j/import/systems.csv

RUN /init.sh