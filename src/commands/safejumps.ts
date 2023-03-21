import { SlashCommandBuilder, CommandInteraction, AutocompleteInteraction } from "discord.js";
import config from "../config";
import neo4j from "neo4j-driver";
import { printSecurity, getSystems } from './jumps';
import { Command } from "../lib/types";
import systems from "../data/systems.json";

const SYSTEM_CHOICES = systems.map((system) => ({
  name: String(system.Name),
  value: String(system.Name),
}));

export default {
  aliases: ['safejumps', 'sj'],
  data: (alias: string) => new SlashCommandBuilder()
    .setName(alias)
    .setDescription('This command will return the jump distance to travel between two given systems.')
    .addStringOption(option =>
      option.setName('start')
        .setDescription('The starting system.')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
      option.setName('end')
        .setDescription('The ending system.')
        .setRequired(true)
        .setAutocomplete(true)),
  help: {
    description: 'This command will return the jump distance to travel between two given systems while preferring to stay within high security systems.',
  },
  async autocomplete(interaction: AutocompleteInteraction) {
    const systemName = interaction.options.getFocused(true);

    const choices = SYSTEM_CHOICES.filter((choice) => choice.name.toLowerCase().indexOf(systemName.value.toLowerCase()) !== -1);

    await interaction.respond(systemName.value !== '' ? choices.slice(0, 25) : SYSTEM_CHOICES.slice(0, 25));
  },
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    const start = interaction.options.get('start')?.value as string;
    const end = interaction.options.get('end')?.value as string;

    const systems = getSystems(interaction, { start, end });
    if (!systems) return;

    const driver = neo4j.driver(config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.username, config.neo4j.password));
    const session = driver.session();
    try {
      const results = await session.run(`
        MATCH (start:System {name: '${systems.start.Name}'}),(end:System {name:'${systems.end.Name}'})
        CALL gds.shortestPath.dijkstra.stream("safejumps", {
          sourceNode: start,
          targetNode: end,
          relationshipWeightProperty: 'cost',
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
      return interaction.editReply(`**${(results.records as any).length}** ${systems.start.Name}${printSecurity(systems.start)} - ${systems.end}${printSecurity(systems.end)} travels through ${printSecurity({ Security: lowest })}`);
    } finally {
      await session.close();
      await driver.close();
    }
  },
} as Command