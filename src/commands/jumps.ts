import {
  AutocompleteInteraction,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import Fuse from "fuse.js";
import neo4j from "neo4j-driver";
import systems from "../data/systems.json";
import config from "../config";
import { Command } from "../lib/types/Command";

const SYSTEM_CHOICES = systems.map((s) => ({
  name: String(s.Name),
  value: String(s.Name),
}));

export function printSecurity(system: { Security: number }) {
  if (system.Security >= 0.5) {
    return `(HS ${system.Security})`;
  } else if (system.Security > 0) {
    return `(LS ${system.Security})`;
  }
  return `(NS ${system.Security})`;
}

export const fuse = new Fuse(systems, {
  keys: ["Name"],
});

export function getSystems(
  interaction: CommandInteraction,
  args: { start: string; end: string }
) {
  const startSearch = fuse.search(args.start);
  if (startSearch.length == 0) {
    interaction.editReply(`Could not find any system matching '${args.start}'`);
    return;
  }
  const start = startSearch[0].item.Name;

  const endSearch = fuse.search(args.end);
  if (endSearch.length == 0) {
    interaction.editReply(`Could not find any system matching '${args.end}'`);
    return;
  }
  const end = endSearch[0].item.Name;

  if (start === end) {
    interaction.editReply(`That's the same system!`);
    return;
  }
  return {
    start: startSearch[0].item,
    end: endSearch[0].item,
  };
}

export default {
  aliases: ["jumps", "j"],
  data: (alias: string) =>
    new SlashCommandBuilder()
      .setName(alias)
      .setDescription(
        "This command will return the shortest jump distance to travel between two given systems."
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
  help: {
    description:
      "This command will return the shortest jump distance to travel between two given systems within New Eden as well as the lowest security rating along the route.",
  },
  async autocomplete(interaction: AutocompleteInteraction) {
    const systemName = interaction.options.getFocused(true).value as string;

    const choices = SYSTEM_CHOICES.filter((s) =>
      s.name.toLowerCase().includes(systemName.toLowerCase())
    );

    await interaction.respond(
      systemName !== "" ? choices.slice(0, 25) : SYSTEM_CHOICES.slice(0, 25)
    );
  },
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    const start = interaction.options.get("start")?.value as string;
    const end = interaction.options.get("end")?.value as string;
    const systems = getSystems(interaction, { start, end });
    if (!systems) return;

    const driver = neo4j.driver(
      config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.username, config.neo4j.password)
    );
    const session = driver.session();
    try {
      const results = await session.run(`
        MATCH (start:System {name: '${systems.start.Name}'}),(end:System {name:'${systems.end.Name}'})
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
      return interaction.editReply(
        `**${(results.records[0] as any)._fields[0].low}** ${
          systems.start.Name
        }${printSecurity(systems.start)} - ${systems.end.Name}${printSecurity(
          systems.end
        )} travels through ${printSecurity({ Security: lowest })}`
      );
    } finally {
      await session.close();
      await driver.close();
    }
  },
} as Command;
