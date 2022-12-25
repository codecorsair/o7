LOAD CSV WITH HEADERS FROM 'file:///systems.csv' AS systems_row
WITH systems_row WHERE systems_row.id IS NOT NULL
CREATE (s:System)
SET s = systems_row
SET s.security = toFloat(s.security);

LOAD CSV WITH HEADERS FROM 'file:///planetary-production.csv' AS planets_row
WITH planets_row WHERE planets_row.planetId IS NOT NULL
CREATE (p:Planet)
SET p = planets_row
SET p.output = toFloat(p.output);

CREATE INDEX system_id_index IF NOT EXISTS
FOR (s:System) ON (s.id);

CREATE INDEX planet_planetId_index IF NOT EXISTS
FOR (p:Planet) ON (p.planetId);

CREATE INDEX planet_resource_index IF NOT EXISTS
FOR (p:Planet) ON (p.resource);

CREATE INDEX planet_richness_index IF NOT EXISTS
FOR (p:Planet) ON (p.richness);

CALL apoc.periodic.iterate(
  "MATCH (a:System),(b:System) WHERE b.neighbors CONTAINS a.id RETURN a, b",
  "CREATE (a)-[g:GATES_TO {name: a.name + '<->' + b.name}]->(b)",
  {batchSize:10000, parallel:true}
);

CALL apoc.periodic.iterate(
  "MATCH (c:System),(p:Planet) WHERE c.planets CONTAINS p.planetId RETURN c, p",
  "CREATE (p)-[w:WITHIN {name: c.name + '->' + p.name}]->(c)",
  {batchSize:10000, parallel:true}
);