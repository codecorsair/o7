import {
  SlashCommandBuilder,
  CommandInteraction,
  AutocompleteInteraction,
} from "discord.js";
import Config from "../Config";
import neo4j from "neo4j-driver";
import { printSecurity, getSystems } from "./jumps";
import { ICommand } from "@/src/shared/interfaces/ICommand";
import systems from "@/data/bot/systems.json";

const SYSTEM_CHOICES = systems.map((system) => ({
  name: String(system.Name),
  value: String(system.Name),
}));

export default {
  aliases: ["safejumps", "sj"],
  commandBuilder: (alias: string) =>
    new SlashCommandBuilder()
      .setName(alias)
      .setDescription(
        "This command will return the jump distance to travel between two given systems."
      )
      .addStringOption((option) =>
        option
          .setName("start")
          .setDescription("The starting system.")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption((option) =>
        option
          .setName("end")
          .setDescription("The ending system.")
          .setRequired(true)
          .setAutocomplete(true)
      ),
  description: "This command will return the jump distance to travel between two given systems.",
  help: {
    title: "Safe Jumps",
    description:
      "This command will return the jump distance to travel between two given systems while preferring to stay within high security systems.",
  },
  async commandAutocomplete(interaction: AutocompleteInteraction) {
    const systemName = interaction.options.getFocused(true);

    const choices = SYSTEM_CHOICES.filter(
      (choice) =>
        choice.name.toLowerCase().indexOf(systemName.value.toLowerCase()) !== -1
    );

    await interaction.respond(
      systemName.value !== ""
        ? choices.slice(0, 25)
        : SYSTEM_CHOICES.slice(0, 25)
    );
  },
  async commandInteraction(interaction: CommandInteraction) {
    await interaction.deferReply();
    const start = interaction.options.get("start")?.value as string;
    const end = interaction.options.get("end")?.value as string;

    const systems = getSystems(interaction, { start, end });
    if (!systems) return;

    const driver = neo4j.driver(
      Config.neo4j.uri,
      neo4j.auth.basic(Config.neo4j.username, Config.neo4j.password)
    );
    const session = driver.session();
    try {
      const results = await session.run(`
        MATCH (start:System {name: '${systems.start.Name}'}),(end:System {name:'${systems.end.Name}'})
        CALL gds.shortestPath.dijkstra.stream("safejumps", {
          sourceNode: start,
          targetNode: end,
          relationshipWeightProperty: 'cost'
        })
        YIELD nodeId, cost
        RETURN gds.util.asNode(nodeId) AS system, cost
      `);
      let lowest = 1;
      for (const record of results.records as any) {
        if (record._fields[0].properties.security < lowest) {
          lowest = record._fields[0].properties.security;
        }
      }
      await interaction.editReply(
        `**${(results.records as any).length}** ${
          systems.start.Name
        }${printSecurity(systems.start)} - ${systems.end}${printSecurity(
          systems.end
        )} travels through ${printSecurity({ Security: lowest })}`
      );
      return;
    } catch (e) {
      console.error(e);
      await interaction.editReply("An error occurred.");
    } finally {
      await session.close();
      await driver.close();
    }
  },
} as ICommand;
