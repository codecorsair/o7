CREATE INDEX ON :System(id)
CREATE INDEX ON :System(name)

CREATE INDEX ON :Planet(planetId)
CREATE INDEX ON :Planet(resource)
CREATE INDEX ON :Planet(richness)

MATCH (p:Planet),(c:System)
WHERE c.planets CONTAINS p.planetId
CREATE (p)-[:WITHIN]->(c)

MATCH (a:System),(b:System)
WHERE b.neighbors CONTAINS a.id
CREATE (a)-[r:GATES_TO { name: a.name + '<->' + b.name }]->(b)



// // DUMP DB
// MATCH (n)
// DETACH DELETE n


// // QUERIES
// MATCH (a:Planet {resource: 'Base Metals'}),(start:System {name: 'Jita'}),p = shortestPath((start)-[:GATES_TO*]-(a))
// WHERE (a.richness = "Perfect" OR a.richness = "Rich")
// RETURN a.planetName, a.system, a.richness, a.output, p
// ORDER BY a.output DESC

// /// 

// MATCH (end:System {name: 'Tanoo'}),(start:System {name: 'Jita'}),p = shortestPath((start)-[:GATES_TO*]-(end))
// RETURN p

// ////

// MATCH (a:Planet {resource: 'Base Metals'})
// WHERE (a.richness = "Perfect" OR a.richness = "Rich")
// WITH collect(a) as planets
// UNWIND planets as planet
// MATCH (start:System {name: 'Jita'}),(end:System {name:planet.system})
// WHERE start.id <> end.id
// MATCH path = shortestPath((start)-[:GATES_TO*..10]-(end))
// RETURN planet.planetName, planet.richness, planet.output, length(path)
// ORDER BY length(path)


// ////////////////////////////////
// INSTALL
// ////////////////////////////////

