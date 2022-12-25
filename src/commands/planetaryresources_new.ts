import Fuse from 'fuse.js';
import { PlanetaryResources } from '../lib/echoes/constants';
import systems from '../data/systems.json';
import neo4j from 'neo4j-driver';
import config from '../config';
import { SlashCommandBuilder, CommandInteraction, AutocompleteInteraction } from 'discord.js';
import { Command } from '../lib/types/Command';

const RESOURCE_CHOICES = Object.values(PlanetaryResources).map(p => ({
  name: String(p),
  value: String(p),
}));

const SYSTEM_CHOICES = systems.map(s => ({
  name: String(s.Name),
  value: String(s.ID),
}));

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

export default {
  data: new SlashCommandBuilder()
    .setName('planetaryresources')
    .setDescription('This command will return the locations of perfect and/or rich planetary resources.')
    .addStringOption(option =>
      option.setName('system')
        .setDescription('The system to search around')
        .setRequired(true)
        .setAutocomplete(true))
    .addIntegerOption(option =>
      option.setName('range')
        .setDescription('The range to search in jumps')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('resource')
        .setDescription('The resource to search for')
        .setRequired(true)
        .setAutocomplete(true)),
  help: {
    description: 'This command will return the locations of perfect and/or rich planetary resources within a specified range of any system.',
    examples: [{
      args: 'jita 5 base metals',
    }],
  },
  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused(true);
    if (focusedValue.name === 'system') {
      const choices = SYSTEM_CHOICES.filter(choice => choice.name.toLowerCase().indexOf(focusedValue.value.toLowerCase()) !== -1);
      await interaction.respond(focusedValue.value !== '' ? choices.slice(0, 25) : SYSTEM_CHOICES.slice(0, 25));
    } else if (focusedValue.name === 'resource') {
      const choices = RESOURCE_CHOICES.filter(choice => choice.name.toLowerCase().indexOf(focusedValue.value.toLowerCase()) !== -1);
      await interaction.respond(focusedValue.value !== '' ? choices.slice(0, 25) : RESOURCE_CHOICES.slice(0, 25));
    }
  },
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    const systemName = interaction.options.get('system')?.value as string;
    let range = interaction.options.get('range')?.value as number;
    const resourceName = interaction.options.get('resource')?.value as string;

    const prSearch = fusePR.search(resourceName);
    if (prSearch.length == 0) {
      return interaction.editReply(`Could not find any planetary resources for "${resourceName}"`);
    }

    const resource = prSearch[0].item.name;
    const sysSearch = fuseSystems.search(systemName);
    if (sysSearch.length == 0) {
      return interaction.editReply(`Could not find any system for '${systemName}'`);
    }

    if (range > 10) {
      return interaction.editReply(`*Max range for this command is 10 jumps, I've reduced the range to 10 and will continue with the search...*`)
    }

    const startSystem = sysSearch[0].item.Name;
    range = Math.min(Math.abs(range), 10);

    const driver = neo4j.driver(config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.username, config.neo4j.password));
    const session = driver.session();

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
      results.records.map((record: any) => {
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
        return interaction.editReply(`It looks like there is no Rich/Perfect ${resource} within ${range} from ${startSystem}. Try a larger range, or a different system.`);
      }

      let response = `**${resource} within ${range} of ${startSystem}**\n`;
      grouped.forEach(g => {
        if (g.length == 0) return;
        g.sort((a, b) => b.output - a.output);
        const title = g[0].distance === 0 ? '**In System**\n' : g[0].distance === 1 ? '**1 Jump**\n' : `**${g[0].distance} Jumps**\n`;
        const next = title + '```' + g.map(s => `${s.system} ${s.constellation.padStart(15 - s.system.length + s.constellation.length)} ${s.richness.padStart(20 - s.constellation.length + s.richness.length, ' ')} ${(s.output + '').padStart(8 - s.richness.length + (s.output + '').length, ' ')}`).join('\n') + '```';
        if (response.length + next.length >= 2000) {
          interaction.editReply(response);
          response = '';
        }
        response += next;
      });
      return interaction.editReply(response);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      await driver.close();
    }
  },
} as Command;