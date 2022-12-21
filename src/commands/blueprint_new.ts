import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { getResponse, getResponseList } from "../lib/bputils";
import { getResponseCapital, getCapitalResponseList } from "../lib/bputils_capital";

export default {
  data: new SlashCommandBuilder()
    .setName('blueprint')
    .setDescription('This command will return a list of all the resources and costs associated to build a given blueprint. Optionally, the resource and time costs will be adjusted based on skill levels, if provided.')
    .addStringOption(option =>
      option.setName('search')
        .setDescription('The search term to use.')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('mobile')
        .setDescription('Whether to use the mobile version of the response.')
        .setRequired(false)),
  async execute(interaction: CommandInteraction) {
    const searchTerm = interaction.options.get('search')?.value as string;
    const mobile = interaction.options.get('mobile')?.value as boolean;
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
        return interaction.reply(`I'm sorry, I couldn't find anything for those search terms.`)
      }
      else {
        let listItem = "";

        lst.forEach(item => {
          listItem += "- " + item + "\n";
        });

        return interaction.reply(`I could not find an exact match... Did you mean?` + "\n" + listItem);
      }
    }

    return interaction.reply({ embeds: [response] });
  }
};