FROM neo4j:latest

WORKDIR /usr/src/app

COPY ./neo4j/entrypoint-wrapper.sh /usr/src/app/entrypoint-wrapper.sh
RUN chmod +x /usr/src/app//entrypoint-wrapper.sh

COPY ./neo4j/wait-for-neo4j.sh /usr/src/app/wait-for-neo4j.sh
RUN chmod +x /usr/src/app//wait-for-neo4j.sh

COPY ./neo4j/init.sh /usr/src/app/init.sh
RUN chmod +x /usr/src/app/init.sh

COPY ./neo4j/planetary-production.csv /var/lib/neo4j/import/planetary-production.csv
COPY ./neo4j/systems.csv /var/lib/neo4j/import/systems.csv

COPY ./neo4j/init.cypher /usr/src/app/init.cypher

ENV NEO4J_PLUGINS='["graph-data-science", "apoc"]'
ENV NEO4J_dbms_security_auth__enabled=false
ENV NEO4J_dbms_security_procedures_allowlist=gds.*,apoc.*
ENV NEO4J_dbms_security_procedures_unrestricted=gds.*apoc.*
ENV NEO4J_dbms_memory_transaction_total_max=4G

ENTRYPOINT [ "/usr/src/app/entrypoint-wrapper.sh" ]
