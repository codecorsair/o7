import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { getResponse, getResponseList } from "../lib/bputils";
import {
  getResponseCapital,
  getCapitalResponseList,
} from "../lib/bputils_capital";
import { Command } from "../lib/types/Command";

export default {
  aliases: ["bp", "blueprint"],
  data: (alias: string) =>  new SlashCommandBuilder()
  .setName(alias)
  .setDescription("This command will return the blueprint for a given ship.")
  .addStringOption((option) =>
    option
      .setName("search")
      .setDescription("The search term to use.")
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName("mobile")
      .setDescription("Whether to use the mobile version of the response.")
      .setRequired(false)
  ),
  help: {
    description:
      "This command will return a list of all the resources and costs associated to build a given blueprint. Optionally, the resource and time costs will be adjusted based on skill levels, if provided.",
    examples: [
      {
        args: "mk5 hob",
        description:
          "Returns the resources and costs for a MK5 Hobgoblin at base rates for an unskilled character.",
      },
      {
        args: "caracal navy 5/5/2",
        description:
          "Returns the resources and costs for a Caracal Navy Issue adjusted for a character with Cruiser Manufacturing 5, Advanced Cruiser Manufacturing 5, and Expert Cruiser Manufacturing 2.",
      },
      {
        args: "vexor 5/5/2 4/1/0",
        description:
          "Returns the resources and costs for a Vexor adjusted for a character with Cruiser Manufacturing 5, Advanced Cruiser Manufacturing 5, and Expert Cruiser Manufacturing 2 and Accounting 4, Advanced Accounting 1, and Expert Accounting 0.",
      },
    ],
  },
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    const searchTerm = interaction.options.get("search")?.value as string;
    const mobile = interaction.options.get("mobile")?.value as boolean;
    // Looking for standards chips
    let response = await getResponse(searchTerm, !!mobile);
    let lst: any;
    let bCapitalSearch = false;

    if (!response) {
      lst = await getResponseList(searchTerm);

      if (lst == null) {
        bCapitalSearch = true;
      }
    }

    // Looking for capitals chips
    if (bCapitalSearch) {
      response = await getResponseCapital(searchTerm, !!mobile);

      if (!response) {
        lst = await getCapitalResponseList(searchTerm);
      }
    }

    // No ships found
    if (!response) {
      if (lst == null) {
        return interaction.editReply(
          `I'm sorry, I couldn't find anything for those search terms.`
        );
      } else {
        let listItem = "";

        lst.forEach((item) => {
          listItem += "- " + item + "\n";
        });

        return interaction.editReply(
          `I could not find an exact match... Did you mean?` + "\n" + listItem
        );
      }
    }

    return interaction.editReply({ embeds: [response] });
  },
} as Command;
