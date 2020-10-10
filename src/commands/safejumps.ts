import { Message, Command } from '../lib/types';
import neo4j from 'neo4j-driver';
import config from '../config.json';
import { printSecurity, getSystems } from './jumps';

const command: Command = {
  name: 'safe jumps',
  alias: ['safejumps', 'sj'],
  args: [{
    name: 'start',
  },{
    name: 'end',
  }],
  help: {
    description: 'This command will return the jump distance to travel between two given systems while preferring to stay within high security systems.',
  },
  handler: async (message: Message, args: { start: string; end: string; }) => {
    const systems = getSystems(message, args);
    if (!systems) return;

    const driver = neo4j.driver(config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.username, config.neo4j.password));
    const session = driver.session();
    try {
      const results = await session.run(`
        MATCH (start:System {name: '${systems.start.Name}'}),(end:System {name:'${systems.end.Name}'})
        CALL gds.alpha.shortestPath.stream({
          nodeProjection: 'System',
            relationshipProjection: {
              GATES_TO: {
                  type: 'GATES_TO',
                    properties: 'cost',
                    orientation: 'UNDIRECTED'
                }
            },
            startNode: start,
            endNode: end,
            relationshipWeightProperty: 'cost',
            writeProperty: 'sssp'
        })
        YIELD nodeId, cost
        RETURN gds.util.asNode(nodeId) AS system, cost
      `);
      let lowest = 1;
      for (const record of (results.records as any)) {
        if (record._fields[0].properties.security < lowest) {
          lowest = record._fields[0].properties.security;
        }
      }
      return message.channel.send(`**${(results.records as any).length}** ${systems.start.Name}${printSecurity(systems.start)} - ${systems.end}${printSecurity(systems.end)} travels through ${printSecurity({Security:lowest})}`);
    } finally {
      await session.close();
      await driver.close();
    }
  }
};

export default command;
