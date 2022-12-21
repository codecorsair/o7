import Fuse from 'fuse.js';
import { Message, CommandDef } from '../lib/types';
import { PlanetaryResources } from '../lib/echoes/constants';
import systems from '../data/systems.json';
import neo4j from 'neo4j-driver';
import config from '../config.json';

/*const resourceFormat = (resource) => {
  const separated = resource.toLowerCase().split(' ');
  const formatted = separated.map(w => w.charAt(0).toUpperCase() + w.substring(1))
  return formatted.join(' ');
}*/

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
    'Constellation'
  ],
});

const command: CommandDef = {
  name: 'constellationresources',
  alias: ['constellationresources', 'cr', 'ci'],
  args: [{
      name: 'system',
    },
    {
      name: 'resource',
      type: 'restContent'
    }],
  help: {
    description: 'This command will return the planet/system(s) of perfect and/or rich planetary resources within the constellation of the system entered. This can be useful to decide decide the best Capsuleer Outpost placement.',
    examples: [{
      args: 'jita reactive metals',
    }],
  },
  handler: async (message: Message, args: { system: string, resource:string}) => {

    const prSearch = fusePR.search(args.resource)
    console.log(prSearch)
    if(prSearch.length == 0) {
      return message.reply(`Could not find any planetary resources for "${args.resource}" in "${args.system}"`);
    }

    let resource = prSearch[0].item.name;
    const constSearch = fuseSystems.search(args.system);
    if (constSearch.length == 0) {
      return message.reply(`Could not find any constellation for '${args.system}'`);
    }

    const constellation = constSearch[0].item.Constellation;
    const driver = neo4j.driver(config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.username, config.neo4j.password));
    const session = driver.session();
    // const startSystem = 'Jita';
    try {
      const results = await session.run(`
        MATCH (planet:Planet {constellation: '${constellation}', resource: '${resource}'})
        RETURN planet.constellation, planet.planetName, planet.richness, planet.output
        ORDER BY planet.output DESC
      `);
      await session.close();

      let count = 0;
      const grouped = new Array(4);
      for (let i = 0; i < 4; ++i) {
        grouped[i] = [];
      }
      const perfect = 0;
      const rich = 1;
      const medium = 2;
      const poor = 3;
      results.records.map((record:any) => {
        const fields = record._fields;
        ++count;
        return {
          system: fields[1],
          richness: fields[2],
          output: fields[3],
        };
      }).forEach(r => {
        switch(r.richness.toLowerCase()) {
          case 'perfect':
            grouped[perfect].push(r);
            break;
          case 'rich':
            grouped[rich].push(r);
            break;
          case 'medium':
            grouped[medium].push(r);
            break;
          case 'poor':
            grouped[poor].push(r);
            break;
        }
      });

      if (count == 0) {
        return message.channel.send(`It looks like there is no Rich/Perfect ${resource} in ${constellation}. Please try a different constellation.`);
      }

      let response = `**${resource} within ${constellation}**\n`;
      grouped.forEach(g => {
        if (g.length == 0) return;
        g.sort((a, b) => b.output - a.output);
        const next = '```' + g.map(s => `${s.system} ${s.richness.padStart(15 - s.system.length + s.richness.length, ' ')} ${(s.output + '').padStart(8 - s.richness.length + (s.output + '').length, ' ')}`).join('\n') + '```';
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
