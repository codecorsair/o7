FROM neo4j:latest

WORKDIR /

COPY ./entrypoint-wrapper.sh /entrypoint-wrapper.sh
RUN chmod +x /entrypoint-wrapper.sh

COPY ./wait-for-neo4j.sh /wait-for-neo4j.sh
RUN chmod +x /wait-for-neo4j.sh

COPY ./planetary-production.csv /var/lib/neo4j/import/planetary-production.csv
COPY ./systems.csv /var/lib/neo4j/import/systems.csv

COPY ./init.cypher /init.cypher

ENV NEO4J_PLUGINS='["graph-data-science", "apoc"]'
ENV NEO4J_dbms_security_auth__enabled=false
ENV NEO4J_dbms_security_procedures_allowlist=gds.*,apoc.*
ENV NEO4J_dbms_security_procedures_unrestricted=gds.*apoc.*
ENV NEO4J_dbms_memory_transaction_total_max=4G

ENTRYPOINT [ "./entrypoint-wrapper.sh" ]