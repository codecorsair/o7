LOAD CSV WITH HEADERS FROM 'file:///systems.csv' AS systems_row
WITH systems_row WHERE systems_row.id IS NOT NULL
CREATE (s:System)
SET s = systems_row
SET s.security = toFloat(s.security)

LOAD CSV WITH HEADERS FROM 'file:///planetary-production.csv' AS planets_row
WITH planets_row WHERE planets_row.planetId IS NOT NULL
CREATE (p:Planet)
SET p = planets_row
SET p.output = toFloat(p.output)

CREATE INDEX system_id ON :System(id)

CREATE INDEX planet_planetId ON :Planet(planetId)
CREATE INDEX planet_resource ON :Planet(resource)
CREATE INDEX planet_richness ON :Planet(richness)

MATCH (a:System),(b:System)
WHERE b.neighbors CONTAINS a.id
CREATE (a)-[r:GATES_TO {name: a.name + '<->' + b.name}]->(b)
return type(r), r.name;

CALL apoc.periodic.iterate(
    "MATCH (c:System),(p:Planet) WHERE c.planets CONTAINS p.planetId RETURN c, p",
    "CREATE (p)-[:WITHIN]->(c)",
    {batchSize:10000, parallel:true}
);