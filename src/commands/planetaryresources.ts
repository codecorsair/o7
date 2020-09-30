import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import Fuse from 'fuse.js';
import neo4j from 'neo4j-driver';
import config from '../config.json';
import systems from '../data/systems.json';

const prFuseOpts = {
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
    'name',
  ]
};

const resourceNames = [
  { name: "Lustering Alloy" },
  { name: "Sheen Compound" },
  { name: "Gleaming Alloy" },
  { name: "Condensed Alloy" },
  { name: "Precious Alloy" },
  { name: "Motley Compound" },
  { name: "Fiber Composite" },
  { name: "Lucent Compound" },
  { name: "Opulent Compound" },
  { name: "Glossy Compound" },
  { name: "Crystal Compound" },
  { name: "Dark Compound" },
  { name: "Reactive Gas" },
  { name: "Noble Gas" },
  { name: "Base Metals" },
  { name: "Heavy Metals" },
  { name: "Noble Metals" },
  { name: "Reactive Metals" },
  { name: "Toxic Metals" },
  { name: "Industrial Fibers" },
  { name: "Supertensile Plastics" },
  { name: "Polyaramids" },
  { name: "Coolant" },
  { name: "Condensates" },
  { name: "Construction Blocks" },
  { name: "Nanites" },
  { name: "Silicate Glass" },
  { name: "Smartfab Units" },
  { name: "Heavy Water" },
  { name: "Suspended Plasma" },
  { name: "Liquid Ozone" },
  { name: "Ionic Solutions" },
  { name: "Oxygen Isotopes" },
  { name: "Plasmoids" },
];
const fusePR = new Fuse(resourceNames, prFuseOpts);

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

export default class PRCommand extends Command {
  constructor() {
    super('planetaryresources', {
      aliases: ['planetaryresources', 'pr', 'pi'],
      args: [
        {
          id: 'system',
        },
        {
          id: 'range',
        },
        {
          id: 'resource',
          match: 'restContent',
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
    if (!args || args.help || !args.system || !args.resource || !args.range) {
      const prefix = (message as any).prefix;
      return message.channel.send(new MessageEmbed()
      .setTitle('Planetary Resources Search Command Help')
      .setDescription('This command will return the locations of perfect and/or rich planetary resources within a specified range of any system. The search range is limited to a maximum of 10 jumps from any system.')
      .addField('Usage', `**${prefix}planetaryresources** system jumprange planetary resource name
*aliases:* **${prefix}pr**, **${prefix}pi**

**example**
**${prefix}pr jita 5 base metals`));
    }

    const prSearch = fusePR.search(args.resource);
    if (prSearch.length == 0) {
      return message.reply(`Could not find any planetary resources for "${args.resource}"`);
    }
    const resource = prSearch[0].item.name;
    const sysSearch = fuseSystems.search(args.system);
    if (sysSearch.length == 0) {
      return message.reply(`Could not find any system for '${args.system}'`);
    }

    if (args.range > 10) {
      message.channel.send(`*Max range for this command is 10 jumps, I've reduced the range to 10 and will continue with the search...*`)
    }
    const startSystem = sysSearch[0].item.Name;
    const range = Math.min(Math.abs(args.range), 10);

    const driver = neo4j.driver(config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.username, config.neo4j.password));
    const session = driver.session();
    // const startSystem = 'Jita';
    try {
      const results = await session.run(`
        MATCH (planet:Planet {resource: '${resource}', system: '${startSystem}'})
        WHERE (planet.richness = "Perfect" OR planet.richness = "Rich")
        RETURN planet.planetName, planet.richness, planet.output, 0 as length
        UNION
        MATCH (a:Planet {resource: '${resource}'})
        WHERE (a.richness = "Perfect" OR a.richness = "Rich")
        WITH collect(a) as planets
        UNWIND planets as planet
        MATCH (start:System {name: '${startSystem}'}),(end:System {name:planet.system})
        WHERE start.id <> end.id
        MATCH path = shortestPath((start)-[:GATES_TO*..${range}]-(end))
        RETURN planet.planetName, planet.richness, planet.output, length(path) as length
        ORDER BY length(path)
      `);
      await session.close();

      let count = 0;
      const grouped = new Array(range + 1);
      for (let i = 0; i < range + 1; ++i) {
        grouped[i] = [];
      }
      results.records.map((record:any) => {
        const fields = record._fields;
        ++count;
        return {
          system: fields[0],
          richness: fields[1],
          output: fields[2],
          distance: fields[3].low as number,
        };
      }).forEach(r => grouped[r.distance].push(r))

      if (count == 0) {
        return message.channel.send(`It looks like there is no Rich/Perfect ${resource} within ${range} from ${startSystem}. Try a larger range, or a different system.`);
      }

      let response = `**Rich/Perfect ${resource} within ${range} of ${startSystem}**\n`;
      grouped.forEach(g => {
        if (g.length == 0) return;
        g.sort((a, b) => b.output - a.output);
        const title = g[0].distance === 0 ? '**In System**\n' : g[0].distance === 1 ? '**1 Jump**\n' : `**${g[0].distance} Jumps**\n`;
        const next = title + '```' + g.map(s => `${s.system} ${s.richness.padStart(15 - s.system.length + s.richness.length, ' ')} ${(s.output + '').padStart(8 - s.richness.length + (s.output + '').length, ' ')}`).join('\n') + '```';
        if (response.length + next.length >= 2000) {
          message.channel.send(response);
          response = '';
        }
        response += next;
      });
      message.channel.send(response);
    } catch (err) {
      console.error(err.message);
    } finally {
      await driver.close();
    }
  }
}


