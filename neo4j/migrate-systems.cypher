MATCH (a:System),(b:System)
WITH a, b
WHERE b.neighbors CONTAINS a.id
CREATE (a)-[r:GATES_TO { name: a.name + '<->' + b.name }]->(b)