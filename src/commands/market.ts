import { Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import { Message } from 'discord.js';
import numeral from 'numeral';
import moment from 'moment';
import config from '../config.json';
import { getLatestValidPrice, getMarketData } from '../lib/market-api';
import items from '../data/items.json';

// copied from src/lib/bputils.ts
// TODO: centralize and export these

const mineralKeys = [
  "tritanium",
  "pyerite",
  "mexallon",
  "isogen",
  "nocxium",
  "zydrine",
  "megacyte",
  "morphite"
];

const piKeys = [
  "lusteringAlloy",
  "sheenCompound",
  "gleamingAlloy",
  "condensedAlloy",
  "preciousAlloy",
  "motleyCompound",
  "fiberComposite",
  "lucentCompound",
  "opulentCompound",
  "glossyCompound",
  "crystalCompound",
  "darkCompound",
  "baseMetals",
  "heavyMetals",
  "reactiveMetals",
  "nobleMetals",
  "toxicMetals",
  "reactiveGas",
  "nobleGas",
  "industrialFibers",
  "supertensilePlastics",
  "polyaramids",
  "coolant",
  "condensates",
  "constructionBlocks",
  "nanites",
  "silicateGlass",
  "smartfabUnits"
];

const oreKeys = [
  "veldspar",
  "plagioclase",
  "scordite",
  "omber",
  "pyroxeres",
  "kernite",
  "darkOchre",
  "gneiss",
  "spodumain",
  "hemorphite",
  "hedbergite",
  "jaspet",
  "crokite",
  "bistot",
  "arkonor",
  "mercoxet"
];

const validSearchKeys = [
  'minerals',
  'mineral',
  'mins',
  'min',
  'planetary',
  'planetary items',
  'planetary item',
  'pl',
  'pi',
  'ore',
  'ores'
];

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

    if (validSearchKeys.includes(args.searchTerms)) {
      try {
        var itemKeys: any;
        var title: string = '';

        switch(args.searchTerms) { 
          case 'minerals':
          case 'mineral':
          case 'mins':
          case 'min': { 
            itemKeys = mineralKeys;
            title = 'Mineral Prices';
            break; 
          } 
          case 'planetary':
          case 'planetary items':
          case 'planetary item':
          case 'pl':
          case 'pi': { 
            itemKeys = piKeys;
            title = 'Planetary Item Prices';
            break; 
          } 
          case 'ore':
          case 'ores': { 
            itemKeys = oreKeys;
            title = 'Ore Prices';
            break; 
          } 
        } 

        const maxEmbedFields = 24; // really 25 but this allows for 8 rows of 3 columns
        const iterationsNeeded = Math.ceil(itemKeys.length / maxEmbedFields) - 1; // how many embeds do we need, zero-based

        for (let currentIteration = 0; currentIteration <= iterationsNeeded; currentIteration++) {
          var outgoingEmbed = new MessageEmbed()

          if (currentIteration == 0) {
            outgoingEmbed.setTitle(title);
          }

          let stopAfter = maxEmbedFields - 1;
          if (currentIteration == iterationsNeeded) { // on last go-around we just need the remaining items, not a full loop
            stopAfter = itemKeys.length - (iterationsNeeded * maxEmbedFields) - 1
          }

          for (let currentKey = 0; currentKey <= stopAfter; currentKey++){
            const item = await getMarketData(itemKeys[(currentIteration * maxEmbedFields) + currentKey]);
            if (!item) {
              // FIXME: what does this case mean?!
              continue
            }
            const itemInfo = items[item.id];
            const price = getLatestValidPrice(item);
            if (!price) {
              // FIXME: what does this case mean?! Currently using double underscore placeholders
              continue
            }
            outgoingEmbed.addField(itemInfo.name, `**B** ${numeral(price.buy).format('0[.]0a') || '__'} *ISK*\n**S** ${numeral(price.sell).format('0[.]0a') || '__'} *ISK*\n**V** ${numeral(price.volume).format('0,0') || 0}\n`, true)
          }

          message.channel.send(outgoingEmbed);
        }
      } catch (err) {
        // oh no
        message.reply(`Oh No! Something went wrong and I was unable to get market data for ${args.searchTerms}.`);
      }
    }
    else {
      try {
        const item = await getMarketData(args.searchTerms);
        if (!item) {
          message.reply(`I'm sorry, I wasn't able to find anything for those search terms.`);
          return;
        }

        const itemInfo = items[item.id];
        const price = getLatestValidPrice(item);
        if (!price) {
          message.reply(`I'm sorry, I wasn't able to find any prices for ${itemInfo.name}.`);
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
        // oh no
        message.reply(`Oh No! Something went wrong and I was unable to get market data for that item.`);
      }
    }
  }
}