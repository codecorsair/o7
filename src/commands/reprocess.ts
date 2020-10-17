import { Message, CommandDef } from '../lib/types';
import { MessageEmbed } from 'discord.js';
import Fuse from 'fuse.js';
import numeral from 'numeral';
import { startCase } from 'lodash';
import reproc from '../data/reproc.json';

// const regex = /((?:mk\s?\d)?[a-zA-Z ]+) ?([0-9.]*)/;

const fuse = new Fuse(reproc, {
  isCaseSensitive: false,
  threshold: 0.4,
  shouldSort: true,
  keys: ['name'],
});

const command: CommandDef = {
  name: 'reprocess',
  alias: ['reprocess', 'rp'],
  args: [{
    name: 'itemName',
    type: 'content',
  }],
  help: {
    description: 'This command will return the resources given when reprocessing an item. Default value returned assumes no skills trained, meaning 30% efficiency. Optionally, providing your reprocessing percentage will adjust the returned value based on the given value.',
    examples: [{
      args: 'spod',
      description: 'Returns the resources given when reprocessing Spodumain at 30% efficiency.'
    },{
      args: 'mk5 stasis web 50',
      description: 'Returns the resources given when reprocessing a MK5 Stasis Webifier at 50% efficiency.',
    }]
  },
  handler: (message: Message, args: { itemName: string; }) => {
    const parsedArgs = args.itemName.toLowerCase().match(/((?:mk\s?\d)?[a-zA-Z ]+) ?([0-9\.]*) ?([0-9]*)/);
    if (!parsedArgs) {
      return message.channel.send(`Sorry, I couldn't understand that.`);
    }

    const searchTerms = parsedArgs[1].trim();
    const searchResult = fuse.search(searchTerms);
    if (!searchResult || searchResult.length == 0) {
      return message.channel.send(`Sorry, I couldn't find any items that could be reprocessed using the item name \`${searchTerms}\`.`);
    }
    const reprocItem = searchResult[0].item;
    const percentage = Math.max(.3, Math.min(.615, (parsedArgs[2] ? parseFloat(parsedArgs[2]) : 30) * .01));
    const reprocAmount = (parsedArgs[3] ? parseInt(parsedArgs[3]) : 1);

    const embed = new MessageEmbed()
      .setTitle(`${reprocItem.name} Reprocess Results`)
      .setDescription(`*efficiency ${numeral(percentage).format('0[.]0%')}*`);

    for (const key in reprocItem) {
      if (key == 'name') continue;
      if (reprocItem[key] === 0) continue;
      embed.addField(startCase(key), numeral(reprocItem[key] * percentage).format('0,0'), true);
      embed.addField(startCase(key), numeral(reprocItem[key] * percentage * reprocAmount[key]).format('0,0'), true);
    }

    return message.channel.send(embed);
  }
};

export default command;
