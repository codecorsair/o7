FROM neo4j:latest

WORKDIR /

COPY ./entrypoint-wrapper.sh /entrypoint-wrapper.sh
RUN chmod +x /entrypoint-wrapper.sh

COPY ./wait-for-neo4j.sh /wait-for-neo4j.sh
RUN chmod +x /wait-for-neo4j.sh

COPY ./planetary-production.csv /planetary-production.csv
COPY ./systems.csv /systems.csv

COPY ./init.cypher /init.cypher

ENV NEO4J_PLUGINS='["graph-data-science"]'
ENV NEO4J_dbms_security_procedures_allowlist=gds.,apoc.
ENV NEO4J_dbms_security_procedures_unrestricted=gds.,apoc.

ENTRYPOINT [ "./entrypoint-wrapper.sh" ]