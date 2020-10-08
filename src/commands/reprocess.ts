import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import Fuse from 'fuse.js';
import numeral from 'numeral';
import { startCase } from 'lodash';
import reproc from '../data/reproc.json';

export default class ReprocessCommand extends Command {
  constructor() {
    super('reprocess', {
      aliases: ['reprocess', 'rp', 'process', 'rep'],
      args: [
        {
          id: 'searchTerms',
          match: 'content',
        },
        {
          id: 'help',
          match: 'flag',
          flag: 'help'
        }
      ]
    });
  }

  exec(message: Message, args: any) {
    if (!args || args.help || !args.searchTerms) {
      return sendHelp(message);
    }

    const parsedArgs = (args.searchTerms + '').toLowerCase().match(regex);
    if (!parsedArgs) {
      return sendHelp(message);
    }

    const searchTerms = parsedArgs[1].trim();
    const searchResult = fuse.search(searchTerms);
    if (!searchResult || searchResult.length == 0) {
      return message.channel.send(`Sorry, I couldn't find any items that could be reprocessed using the search terms \`${searchTerms}\`.`);
    }
    const reprocItem = searchResult[0].item;
    const percentage = Math.max(.3, Math.min(.615, (parsedArgs[2] ? parseFloat(parsedArgs[2]) : 30) * .01));

    const embed = new MessageEmbed()
      .setTitle(`${reprocItem.name} Reprocess Results`)
      .setDescription(`*efficiency ${numeral(percentage).format('0[.]0%')}*`);

    for (const key in reprocItem) {
      if (key == 'name') continue;
      if (reprocItem[key] === 0) continue;
      embed.addField(startCase(key), numeral(reprocItem[key] * percentage).format('0,0'), true);
    }

    return message.channel.send(embed);
  }
}

const regex = /((?:mk\s?\d)?[a-zA-Z ]+) ?([0-9.]*)/;

const fuse = new Fuse(reproc, {
  isCaseSensitive: false,
  threshold: 0.4,
  shouldSort: true,
  keys: ['name'],
});

function sendHelp(message: Message) {
  const prefix = (message as any).prefix;
      return message.channel.send(new MessageEmbed()
        .setTitle('Reprocess Command Help')
        .setDescription('This command will return the resources given when reprocessing an item. Default value returned assumes no skills trained, meaning 30% efficiency. Optionally, providing your reprocessing percentage will adjust the returned value based on the given value.')
        .addField('Usage', `**${prefix}reprocess** item name (# - optional efficiency percentage)
*alias:* **${prefix}rp**, **${prefix}rep**, **${prefix}process**

**examples:**
\`${prefix}rp spod\`
-> *returns the resources given when reprocessing Spodumain at 30% efficiency*

\`${prefix}rp spod 50\`
-> *returns the resources given when reprocessing Spodumain at 50% efficiency*

\`${prefix}rp spod 90\`
-> *returns the resources given when reprocessing Spodumain at 61.5% efficiency as that's the maximum possible*`));
}