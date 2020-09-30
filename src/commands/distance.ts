import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
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
    super('distance', {
      aliases: ['distance', 'shortest', 'jumps', 'j'],
      args: [
        {
          id: 'start',
        },
        {
          id: 'end',
        },
        {
          id: 'help',
          match: 'flag',
          flag: 'help'
        }
      ]
    });
  }

  async exec(message: Message, args: any) {
    if (!args || args.help || !args.start || !args.end) {
      const prefix = (message as any).prefix;
      return message.channel.send(new MessageEmbed()
        .setTitle('Jumps Command Help')
        .setDescription('This command will return the shortest jump distance to travel between two given systems within New Eden as well as the lowest security rating along the route.')
        .addField('Usage', `**${prefix}jumps** startSystem endSystem

        *aliases:* **${prefix}j**, **${prefix}distance**, **${prefix}shortest**`));
    }

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
        MATCH path = shortestPath((start)-[:GATES_TO*]-(end))
        RETURN length(path), path
      `);
      let lowest = 1;
      for (const segment of (results.records[0] as any)._fields[1].segments) {
        if (segment.start.properties.security < lowest) {
          lowest = segment.start.properties.security;
        }
        if (segment.end.properties.security < lowest) {
          lowest = segment.end.properties.security;
        }
      }
      return message.channel.send(`**${(results.records[0] as any)._fields[0].low}** ${start}${printSecurity(startSearch[0].item)} - ${end}${printSecurity(endSearch[0].item)} travels through ${printSecurity({Security: lowest})}`);
    } finally {
      await session.close();
      await driver.close();
    }
  }
}

function printSecurity(system: { Security: number }) {
  if (system.Security >= 0.5) {
    return `(HS ${system.Security})`
  } else if (system.Security > 0) {
    return `(LS ${system.Security})`;
  }
  return `(NS ${system.Security})`;
}