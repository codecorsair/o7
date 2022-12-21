LOAD CSV WITH HEADERS FROM 'file:///planetary-production.csv' AS planet_row
WITH planet_row WHERE planet_row.planetId IS NOT NULL
CREATE (p:Planet)
SET p = planet_row
SET p.output = toFloat(p.output)