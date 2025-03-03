import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  AutocompleteInteraction
} from 'discord.js';
import Fuse from 'fuse.js';
import { startCase } from 'lodash';
import reproc from '@/data/reproc.json';
import { ICommand } from '@/shared/interfaces/ICommand';
import numeral from 'numeral';
import marketItems from '@/data/market-items.json';

const fuse = new Fuse(reproc, {
  isCaseSensitive: false,
  threshold: 0.4,
  shouldSort: true,
  keys: ['name']
});

const ITEM_CHOICES = marketItems.map((item) => ({
  name: String(item.name),
  value: String(item.name)
}));

export default {
  aliases: ['reproc', 'r'],
  commandBuilder: (alias: string) =>
    new SlashCommandBuilder()
      .setName(alias)
      .setDescription(
        'This command will return the reprocessing results for a given item.'
      )
      .addStringOption((option) =>
        option
          .setName('item')
          .setDescription('The item to reprocess.')
          .setAutocomplete(true)
          .setRequired(true)
      ),
  description:
    'This command will return the reprocessing results for a given item.',
  help: {
    title: 'Reprocessing',
    description:
      'This command will return the resources given when reprocessing an item. Default value returned assumes no skills trained, meaning 30% efficiency. Optionally, providing your reprocessing percentage will adjust the returned value based on the given value.',
    examples: [
      {
        args: ['spod'],
        description:
          'Returns the resources given when reprocessing Spodumain at 30% efficiency.'
      },
      {
        args: ['mk5', 'stasis', 'web', '50'],
        description:
          'Returns the resources given when reprocessing a MK5 Stasis Webifier at 50% efficiency.'
      }
    ]
  },
  async commandAutocomplete(interaction: AutocompleteInteraction) {
    const itemName = interaction.options.getFocused(true);

    const choices = ITEM_CHOICES.filter(
      (choice) =>
        choice.name.toLowerCase().indexOf(itemName.value.toLowerCase()) !== -1
    );

    await interaction.respond(
      itemName.value !== '' ? choices.slice(0, 25) : ITEM_CHOICES.slice(0, 25)
    );
  },
  async commandInteraction(interaction: CommandInteraction) {
    await interaction.deferReply();
    const itemName = interaction.options.get('item')?.value as string;
    const parsedArgs = itemName
      .toLowerCase()
      .match(/((?:mk\s?\d)?[a-zA-Z ]+) ?([0-9.]*)/);
    if (!parsedArgs) {
      await interaction.editReply(`Sorry, I couldn't understand that.`);
      return;
    }

    const searchTerms = parsedArgs[1].trim();
    const searchResult = fuse.search(searchTerms);
    if (!searchResult || searchResult.length == 0) {
      await interaction.editReply(
        `Sorry, I couldn't find any items that could be reprocessed using the item name \`${searchTerms}\`.`
      );
      return;
    }
    const reprocItem = searchResult[0].item as any;
    const percentage = Math.max(
      0.3,
      Math.min(0.615, (parsedArgs[2] ? parseFloat(parsedArgs[2]) : 30) * 0.01)
    );

    const embed = new EmbedBuilder()
      .setTitle(`${reprocItem.name} Reprocess Results`)
      .setDescription(`*efficiency ${numeral(percentage).format('0[.]0%')}*`);

    for (const key in reprocItem) {
      if (key == 'name') continue;
      if (reprocItem[key] === 0) continue;
      embed.addFields([
        {
          name: startCase(key),
          value: numeral(reprocItem[key] * percentage).format('0,0'),
          inline: true
        }
      ]);
    }

    await interaction.editReply({ embeds: [embed] });
    return;
  }
} as ICommand;
