import Fuse from 'fuse.js';
import { Message, CommandDef } from '../lib/types';
import { PlanetaryResources } from '../lib/echoes/constants';
import systems from '../data/systems.json';
import neo4j from 'neo4j-driver';
import config from '../config.json';

const prNames = Object.values(PlanetaryResources).map(p => ({ name: p }));
const fusePR = new Fuse(prNames, {
  ignoreLocation: true,
  keys: [
    'name',
  ],
});

const fuseSystems = new Fuse(systems, {
  ignoreLocation: true,
  keys: [
    'Name',
  ],
});

const command: CommandDef = {
  name: 'planetaryresources',
  alias: ['planetaryresources', 'pr', 'pi'],
  args: [{
      name: 'system',
    },{
      name: 'range',
      type: 'number',
    },{
      name: 'resource',
      type: 'restContent',
    }],
  help: {
    description: 'This command will return the locations of perfect and/or rich planetary resources within a specified range of any system. The search range is limited to a maximum of 10 jumps from any system.',
    examples: [{
      args: 'jita 5 base metals',
    }],
  },
  handler: async (message: Message, args: { system: string; range: number; resource: string; }) => {
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
        RETURN planet.planetName, planet.constellation, planet.richness, planet.output, 0 as length
        UNION
        MATCH (a:Planet {resource: '${resource}'})
        WITH collect(a) as planets
        UNWIND planets as planet
        MATCH (start:System {name: '${startSystem}'}),(end:System {name:planet.system})
        WHERE start.id <> end.id
        MATCH path = shortestPath((start)-[:GATES_TO*..${range}]-(end))
        RETURN planet.planetName, planet.constellation, planet.richness, planet.output, length(path) as length
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
          constellation: fields[1],
          richness: fields[2],
          output: fields[3],
          distance: fields[4].low as number,
        };
      }).forEach(r => grouped[r.distance].push(r));

      if (count == 0) {
        return message.channel.send(`It looks like there is no Rich/Perfect ${resource} within ${range} from ${startSystem}. Try a larger range, or a different system.`);
      }

      let response = `**${resource} within ${range} of ${startSystem}**\n`;
      grouped.forEach(g => {
        if (g.length == 0) return;
        g.sort((a, b) => b.output - a.output);
        const title = g[0].distance === 0 ? '**In System**\n' : g[0].distance === 1 ? '**1 Jump**\n' : `**${g[0].distance} Jumps**\n`;
        const next = title + '```' + g.map(s => `${s.system} ${s.constellation.padStart(15 - s.system.length + s.constellation.length)} ${s.richness.padStart(20 - s.constellation.length + s.richness.length, ' ')} ${(s.output + '').padStart(8 - s.richness.length + (s.output + '').length, ' ')}`).join('\n') + '```';
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
};

export default command;

