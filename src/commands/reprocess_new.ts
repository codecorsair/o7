import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";
import Fuse from "fuse.js";
import { startCase } from "lodash";
import reproc from '../data/reproc.json';
import { Command } from "../lib/types/Command";
import numeral from "numeral";

const fuse = new Fuse(reproc, {
  isCaseSensitive: false,
  threshold: 0.4,
  shouldSort: true,
  keys: ['name'],
});

export default {
  data: new SlashCommandBuilder()
    .setName('reprocess')
    .setDescription('This command will return the reprocessing results for a given item.')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('The item to reprocess.')
        .setRequired(true)),
  help: {
    description: 'This command will return the resources given when reprocessing an item. Default value returned assumes no skills trained, meaning 30% efficiency. Optionally, providing your reprocessing percentage will adjust the returned value based on the given value.',
    examples: [{
      args: 'spod',
      description: 'Returns the resources given when reprocessing Spodumain at 30% efficiency.'
    }, {
      args: 'mk5 stasis web 50',
      description: 'Returns the resources given when reprocessing a MK5 Stasis Webifier at 50% efficiency.',
    }]
  },
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    const itemName = interaction.options.get('item')?.value as string;
    const parsedArgs = itemName.toLowerCase().match(/((?:mk\s?\d)?[a-zA-Z ]+) ?([0-9.]*)/);
    if (!parsedArgs) {
      return interaction.editReply(`Sorry, I couldn't understand that.`);
    }

    const searchTerms = parsedArgs[1].trim();
    const searchResult = fuse.search(searchTerms);
    if (!searchResult || searchResult.length == 0) {
      return interaction.editReply(`Sorry, I couldn't find any items that could be reprocessed using the item name \`${searchTerms}\`.`);
    }
    const reprocItem = searchResult[0].item as any;
    const percentage = Math.max(.3, Math.min(.615, (parsedArgs[2] ? parseFloat(parsedArgs[2]) : 30) * .01));

    const embed = new EmbedBuilder()
      .setTitle(`${reprocItem.name} Reprocess Results`)
      .setDescription(`*efficiency ${numeral(percentage).format('0[.]0%')}*`);

    for (const key in reprocItem) {
      if (key == 'name') continue;
      if (reprocItem[key] === 0) continue;
      embed.addFields([{
        name: startCase(key), value: numeral(reprocItem[key] * percentage).format('0,0'), inline: true
      }]);
    }

    return interaction.editReply({ embeds: [embed] });
  }
} as Command