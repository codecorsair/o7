import {
  SlashCommandBuilder,
  CommandInteraction,
  AutocompleteInteraction,
} from "discord.js";
import Fuse from "fuse.js";
import Config from "../Config"
import systems from "@/data/systems.json";
import neo4j from "neo4j-driver";
import { PlanetaryResources } from "../constants";
import { ICommand } from "@/shared/interfaces/ICommand";

const RESOURCE_CHOICES = Object.values(PlanetaryResources).map((p) => ({
  name: String(p),
  value: String(p),
}));

const SYSTEM_CHOICES = systems.map((s) => ({
  name: String(s.Name),
  value: String(s.Name),
}));

const prNames = Object.values(PlanetaryResources).map((p) => ({ name: p }));
const fusePR = new Fuse(prNames, {
  ignoreLocation: true,
  keys: ["name"],
});

const fuseSystems = new Fuse(systems, {
  ignoreLocation: true,
  keys: ["Name", "Constellation"],
});

export default {
  aliases: ["constellationresources", "cr"],
  commandBuilder: (alias: string) =>
    new SlashCommandBuilder()
      .setName(alias)
      .setDescription(
        "This command will return the locations of perfect and/or rich planetary resources."
      )
      .addStringOption((option) =>
        option
          .setName("system")
          .setDescription("The system to search for.")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption((option) =>
        option
          .setName("resource")
          .setDescription("The resource to search for.")
          .setRequired(true)
          .setAutocomplete(true)
      ),
  description: "This command will return the locations of perfect and/or rich planetary resources.",
  help: {
    title: "Constellation Resources",
    description:
      "This command will return the planet/system(s) of perfect and/or rich planetary resources within the constellation of the system entered. This can be useful to decide decide the best Capsuleer Outpost placement.",
    examples: [
      {
        args: ["jita reactive metals"],
        description: "Returns the planet/system(s) of perfect and/or rich reactive metals within the constellation of Jita.",
      },
    ],
  },
  async commandAutocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused(true);
    if (focusedValue.name === "system") {
      const choices = SYSTEM_CHOICES.filter((s) =>
        s.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
      );
      return interaction.respond(
        focusedValue.value !== ""
          ? choices.slice(0, 25)
          : SYSTEM_CHOICES.slice(0, 25)
      );
    } else if (focusedValue.name === "resource") {
      const choices = RESOURCE_CHOICES.filter((s) =>
        s.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
      );
      return interaction.respond(
        focusedValue.value !== ""
          ? choices.slice(0, 25)
          : RESOURCE_CHOICES.slice(0, 25)
      );
    }
  },
  async commandInteraction(interaction: CommandInteraction) {
    await interaction.deferReply();
    const systemName = interaction.options.get("system")?.value as string;
    const resourceName = interaction.options.get("resource")?.value as string;
    const prSearch = fusePR.search(resourceName);
    console.log(prSearch);
    if (prSearch.length == 0) {
      await interaction.editReply(
        `Could not find any planetary resources for "${resourceName}" in "${systemName}"`
      );
      return;
    }

    let resource = prSearch[0].item.name;
    const constSearch = fuseSystems.search(systemName);
    if (constSearch.length == 0) {
      await interaction.editReply(
        `Could not find any constellation for '${systemName}'`
      );
      return;
    }

    const constellation = constSearch[0].item.Constellation;
    const driver = neo4j.driver(
      Config.neo4j.uri,
      neo4j.auth.basic(Config.neo4j.username, Config.neo4j.password)
    );
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
      results.records
        .map((record: any) => {
          const fields = record._fields;
          ++count;
          return {
            system: fields[1],
            richness: fields[2],
            output: fields[3],
          };
        })
        .forEach((r) => {
          switch (r.richness.toLowerCase()) {
            case "perfect":
              grouped[perfect].push(r);
              break;
            case "rich":
              grouped[rich].push(r);
              break;
            case "medium":
              grouped[medium].push(r);
              break;
            case "poor":
              grouped[poor].push(r);
              break;
          }
        });

      if (count == 0) {
        await interaction.editReply(
          `It looks like there is no Rich/Perfect ${resource} in ${constellation}. Please try a different constellation.`
        );
        return;
      }

      let response = `**${resource} within ${constellation}**\n`;
      grouped.forEach((g) => {
        if (g.length == 0) return;
        g.sort((a, b) => b.output - a.output);
        const next =
          "```" +
          g
            .map(
              (s) =>
                `${s.system} ${s.richness.padStart(
                  15 - s.system.length + s.richness.length,
                  " "
                )} ${(s.output + "").padStart(
                  8 - s.richness.length + (s.output + "").length,
                  " "
                )}`
            )
            .join("\n") +
          "```";
        if (response.length + next.length >= 2000) {
          interaction.editReply(response);
          response = "";
        }
        response += next;
      });
      await interaction.editReply(response);
      return;
    } catch (err: any) {
      await interaction.editReply(
        `There was an error processing your request. Please try again later.`
      );
      throw err;
    } finally {
      await driver.close();
    }
  },
} as ICommand;
