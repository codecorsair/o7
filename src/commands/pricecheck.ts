import { Message, CommandDef } from '../lib/types';
import { MessageEmbed } from 'discord.js';
import numeral from 'numeral';
import moment from 'moment';
import { getLatestValidPrice, getMarketData } from '../lib/market-api';
import items from '../data/items.json';
import { Ores, PlanetaryResources, Minerals } from '../lib/echoes';
import { startCase } from 'lodash';

const oreKeys = Object.values(Ores).map(_ => _.toLowerCase());
const mineralKeys = Object.values(Minerals).map(_ => _.toLowerCase());
const piKeys = Object.values(PlanetaryResources).map(_ => _.toLowerCase());

const customKeywords = {
  'minerals': { title: 'mineral', keys: mineralKeys },
  'mineral': { title: 'mineral', keys: mineralKeys },
  'mins': { title: 'mineral', keys: mineralKeys },
  'min': { title: 'mineral', keys: mineralKeys },
  'planetary': { title: 'planetary resource', keys: piKeys },
  'planetary items': { title: 'planetary resource', keys: piKeys },
  'planetary item': { title: 'planetary resource', keys: piKeys },
  'pl': { title: 'planetary resource', keys: piKeys },
  'pi': { title: 'planetary resource', keys: piKeys },
  'pr': { title: 'planetary resource', keys: piKeys },
  'planetary resource': { title: 'planetary resource', keys: piKeys },
  'planetary resources': { title: 'planetary resource', keys: piKeys },
  'ore': { title: 'ore', keys: oreKeys },
  'ores': { title: 'ore', keys: oreKeys },
};

const command: CommandDef = {
  name: 'price check',
  alias: ['pricecheck', 'pc', 'price', 'value', 'market'],
  args: [{
    name: 'itemName',
    type: 'content',
  }],
  help: {
    description: 'This command will return market price data which is queried from <https://eve-echoes-market.com>.',
    examples: [{
      args: 'caracal navy',
      description: 'Get the price details for a Caracal Navy Issue.',
    },{
      args: 'minerals',
      description: 'Get the prices of all minerals',
    },{
      args: 'ore',
      description: 'Get the prices of all ore.',
    },{
      args: 'planetary',
      description: 'Get the prices of all planetary resources.'
    }],
  },
  handler: async (message: Message, args: { itemName: string; }) => {

    if (customKeywords[args.itemName]) {
      const special = customKeywords[args.itemName];
      let embed = new MessageEmbed()
        .setTitle(`${startCase(special.title)} Prices`);
      let counter = 0;
      for (const key of special.keys) {
        const specialItem = await getMarketData(key);
        if (specialItem) {
          const itemInfo = items[specialItem.id];
          const price = getLatestValidPrice(specialItem);
          if (price) {
            embed.addField(itemInfo.name, `**B** ${numeral(price.buy).format('0[.]0a') || '__'} *ISK*\n**S** ${numeral(price.sell).format('0[.]0a') || '__'} *ISK*\n**V** ${numeral(price.volume).format('0,0') || 0}\n`, true)
          } else {
            embed.addField(startCase(key), 'unknown', true);
          }
        } else {
          embed.addField(startCase(key), 'unknown', true);
        }
        if (++counter === 24) {
          message.channel.send(embed);
          embed = new MessageEmbed();
        }
      }
      if (counter > 0) {
        message.channel.send(embed);
      }
      return;
    }
    
    try {
      const item = await getMarketData(args.itemName);
      if (!item) {
        message.channel.send(`I'm sorry, I wasn't able to find anything for those search terms.`);
        return;
      }

      const itemInfo = items[item.id];
      const price = getLatestValidPrice(item);
      if (!price) {
        message.channel.send(`I'm sorry, I wasn't able to find any prices for ${itemInfo.name}.`);
        return;
      }

      message.channel.send(new MessageEmbed()
          .setTitle(itemInfo.name)
          .setThumbnail(`https://storage.googleapis.com/o7-store/icons/${itemInfo.icon_id}.png`)
          .setDescription(`\
**Buy Order** ${numeral(price.buy).format('0[.]0a')}
**Sell Order** ${numeral(price.sell).format('0[.]0a')}
**Volume** ${price.volume || 0}
_last updated ${moment(price.time * 1000).fromNow()}_`)
        );

    } catch (err) {
      message.channel.send(`Oh No! Something went wrong and I was unable to get market data for that item.`);
    }
  }
};

export default command;
