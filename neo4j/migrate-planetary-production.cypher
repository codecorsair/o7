MATCH (p:Planet),(c:System)
WITH p, c
WHERE c.planets CONTAINS p.planetId
CREATE (p)-[:WITHIN]->(c)