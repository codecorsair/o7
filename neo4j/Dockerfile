FROM neo4j:latest

WORKDIR /

COPY ./entrypoint-wrapper.sh /entrypoint-wrapper.sh
RUN chmod +x /entrypoint-wrapper.sh

COPY init.sh /init.sh
RUN chmod +x /init.sh
ENV EXTENSION_SCRIPT=/init.sh

COPY ./planetary-production.csv /var/lib/neo4j/import/planetary-production.csv
COPY ./systems.csv /var/lib/neo4j/import/systems.csv
COPY ./init.cypher /var/lib/neo4j/import/init.cypher

RUN /init.sh

ENTRYPOINT [ "./entrypoint-wrapper.sh" ]