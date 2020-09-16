import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import { Message } from 'discord.js';
import numeral from 'numeral';
import moment from 'moment';
import config from '../config.json';
import { getMarketData } from '../lib/market-api';

export default class PingCommand extends Command {
  constructor() {
    super('market', {
      aliases: ['market', 'mp', 'pc', 'price', 'pricecheck', 'value'],
      args: [
        {
          id: 'searchTerms',
          match: 'content',
          default: '',
        }
      ],
    });
  }

  async exec(message: Message, args: any) {
    if (!args.searchTerms) {
      message.reply(`Oops! It looks like you forgot to tell me what you wanted to search for.\n**Market Price Usage**\n${config.prefix}pc item name`);
      return;
    }

    try {
      const item = await getMarketData(args.searchTerms);
      if (!item) {
        message.reply(`I'm sorry, I wasn't able to find anything for those search terms.`);
        return;
      }
      const price = item.prices[0];
      message.channel.send(new MessageEmbed()
        .setTitle(item.name_en)
        .setDescription(`\
          **Buy** ${numeral(price.highest_buy).format('0[.]0a')}
          **Sell** ${numeral(price.lowest_sell).format('0[.]0a')}
          **Volume** ${price.volume || 0}
          _last updated ${moment(price.time * 1000).fromNow()}_`)
      );

    } catch (err) {
      // oh no
      message.reply(`Oh No! Something went wrong and I was unable to get market data for that item.`);
    }
  }
}