LOAD CSV WITH HEADERS FROM 'file:///systems.csv' AS systems_row
WITH systems_row WHERE systems_row.id IS NOT NULL
CREATE (s:System)
SET s = systems_row
SET s.planets = split(s.planets, ',')

// CREATE TEXT INDEX system_id ON :System(id)

// CREATE TEXT INDEX planet_planetId ON :Planet(planetId)
// CREATE TEXT INDEX planet_resource ON :Planet(resource)
// CREATE TEXT INDEX planet_richness ON :Planet(richness)

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

