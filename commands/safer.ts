import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import Fuse from 'fuse.js';
import neo4j from 'neo4j-driver';
import config from '../config.json';
import systems from '../data/systems.json';

const systemFuseOpts = {
  isCaseSensitive: false,
  shouldSort: true,
  includeScore: true,
  ignoreLocation: true,
  includeMatches: false,
  findAllMatches: false,
  minMatchCharLength: 1,
  location: 0,
  threshold: 0.6,
  distance: 100,
  useExtendedSearch: false,
  ignoreFieldNorm: true,
  sort: (a: { score: number }, b: { score: number }) => a.score - b.score,
  keys: [
    'Name',
  ]
};
const fuseSystems = new Fuse(systems, systemFuseOpts);

export default class PingCommand extends Command {
  constructor() {
    super('safest', {
      aliases: ['safest', 'safejumps'],
      args: [
        {
          id: 'start',
        },
        {
          id: 'end',
        }
      ]
    });
  }

  async exec(message: Message, args: any) {
    if (!args || !args.start || !args.end) {
      return message.channel.send('Invalid args!\nUsage: **jumps** <system> <system>');
    }

    const startSearch = fuseSystems.search(args.start);
    if (startSearch.length == 0) {
      return message.channel.send(`Could not find any system matching '${args.start}'`);
    }
    const start = startSearch[0].item.Name;

    const endSearch = fuseSystems.search(args.end);
    if (endSearch.length == 0) {
      return message.channel.send(`Could not find any system matching '${args.end}'`);
    }
    const end = endSearch[0].item.Name;

    if (start === end) {
      return message.channel.send(`That's the same system!`)
    }

    const driver = neo4j.driver(config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.username, config.neo4j.password));
    const session = driver.session();
    try {
      const results = await session.run(`
        MATCH (start:System {name: '${start}'}),(end:System {name:'${end}'})
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
        RETURN gds.util.asNode(nodeId).name AS name, cost
      `);
      return message.channel.send(`**${(results.records as any).length}** *PREFER SAFER* (${start} - ${end})`);
    } finally {
      await session.close();
      await driver.close();
    }
  }
}