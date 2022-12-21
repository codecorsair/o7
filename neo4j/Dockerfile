FROM neo4j:latest

WORKDIR /

COPY ./entrypoint-wrapper.sh /entrypoint-wrapper.sh
RUN chmod +x /entrypoint-wrapper.sh

COPY ./wait-for-neo4j.sh /wait-for-neo4j.sh
RUN chmod +x /wait-for-neo4j.sh

COPY ./planetary-production.csv /planetary-production.csv
COPY ./systems.csv /systems.csv

COPY ./init-systems.cypher /init-systems.cypher
COPY ./init-planetary-production.cypher /init-planetary-production.cypher
COPY ./migrate-systems.cypher /migrate-systems.cypher
COPY ./migrate-planetary-production.cypher /migrate-planetary-production.cypher

ENV NEO4J_AUTH=${NEO4J_USERNAME:-neo4j}/${NEO4J_PASSWORD:-neo4j_password}

ENTRYPOINT [ "./entrypoint-wrapper.sh" ]