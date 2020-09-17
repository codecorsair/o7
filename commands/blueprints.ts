import { MessageEmbed, Message } from 'discord.js';
import { Command } from 'discord-akairo';
import Fuse from 'fuse.js';
import numeral from 'numeral';
import moment from 'moment';
import { startCase } from 'lodash';

import blueprints from '../data/blueprints.json';
import { getMarketData } from '../lib/market-api';
import { MarketItem } from '../lib/market-api';

const fuseOptions = {
  isCaseSensitive: false,
  shouldSort: true,
  includeScore: true,
  ignoreLocation: true,
  includeMatches: false,
  findAllMatches: false,
  minMatchCharLength: 1,
  location: 0,
  threshold: 0.6,
  distance: 100,
  useExtendedSearch: false,
  ignoreFieldNorm: true,
  sort: (a: { score: number }, b: { score: number }) => b.score - a.score,
  keys: [
    'name',
    {
      name: 'keywords',
      weight: 2,
    }
  ]
}

interface ResourcePrices {
  [id:string]: MarketItem;
}

const regex = /((?:mk\s?\d)?[a-zA-Z ]+[a-zA-Z](?: [0-9]+(?!\/))?)(?:(?:\s+|\s*-\s*)(\d+(?:\/\d+)*))?/;

export default class BlueprintCommand extends Command {

  private fuse: Fuse<any>;
  private resourcePrices: ResourcePrices = {};

  constructor() {
    super('blueprint', {
      aliases: ['bp', 'blueprint'],
      args: [
        {
          id: 'value',
          match: 'content',
          default: '',
        }
      ],
    });

    const bps = blueprints.map(bp => {
      const name = bp.name.toLowerCase()
      const keywords = name.split(' ');
      if (name.endsWith(' iii')) {
        keywords.push('3');
        keywords.push('iii');
      } else if (name.endsWith(' ii')) {
        keywords.push('2');
        keywords.push('ii');
      } else if (name.endsWith(' i')) {
        keywords.push('1');
        keywords.push('i')
      }
      return {
        ...bp,
        name,
        keywords,
      };
    });

    this.fuse = new Fuse(bps, fuseOptions);
    getResourcePrices().then(prices => this.resourcePrices = prices);
    setTimeout(async () => {
      this.resourcePrices = await getResourcePrices();
    }, 5 * 60 * 1000);
  }



  async exec(message: Message, args: any) {
    
    const parsedArgs = args.value.match(regex);
    const name = parsedArgs[1].trim();
    
    const results = this.fuse.search(name);
    if (results.length == 0) {
      return message.reply(`No blueprint found for search term \`${args.name}\`!`);
    }
    
    const skillLevels = parsedArgs[2] && parsedArgs[2].split('/').map((s: string) => parseInt(s)) || [];
    const mod = skillModifier(skillLevels);
    let total = { cost: 0 };

    const bp = results[0].item;
    let embed = new MessageEmbed()
      .setColor('#0DE1A1')
      .setTitle(bp.name)
      .setDescription(`Type **${bp.type}**\nTech Level **${bp.techLevel}**`);
    if (hasAny(bp, mineralKeys)) {
      embed = embed.addField('Minerals', printKeys(bp, mineralKeys, mod.material, this.resourcePrices, total));
    }

    if (hasAny(bp, piKeys)) {
      embed = embed.addField('Planetary Resources', printKeys(bp, piKeys, mod.material, this.resourcePrices, total));
    }

    if (hasAny(bp, salvageKeys)) {
      embed = embed.addField('Salvage', printKeys(bp, salvageKeys, mod.material, this.resourcePrices, total));
    }

    embed = embed.addField('Production', printProduction(bp, mod.time));

    total.cost += bp.productionCost;

    const itemPrice = await getMarketData(bp.name);
    const bpPrice = await getMarketData(bp.name + ' blueprint');
    if (itemPrice && bpPrice) {
      embed = embed.addField('Cost', printCosts(bp, itemPrice, bpPrice, total));
    }
    return message.reply(embed);
  }
}

function printCosts(bp: { productionCount: number; }, item: MarketItem, blueprint: MarketItem, total: { cost: number }) {
  const latestPrice = item.prices[0];
  const bpPrice = blueprint.prices[0];
  const sellOrderLow = latestPrice.lowest_sell * bp.productionCount;
  const sellOrderMed = latestPrice.median_sell * bp.productionCount;

  let result = '```\n'
  result += alignText('Cost to build', `${numeral(total.cost).format('0[.]0a')} ISK\n`);
  result += alignText('Blueprint Cost', `low ${numeral(bpPrice.lowest_sell).format('0[.]0a')} ISK | median ${numeral(bpPrice.median_sell).format('0[.]0a')} ISK\n`);
  result += alignText('Market sell', `low ${numeral(sellOrderLow).format('0[.]0a')} ISK | median ${numeral(sellOrderMed).format('0[.]0a')} ISK\n`);
  result += alignText('Profit margin', `low ${numeral(sellOrderLow - total.cost).format('0[.]0a')} ISK | median ${numeral(sellOrderMed - total.cost).format('0[.]0a')} ISK\n`);
  result += alignText('Profit margin (buy BP)', `low ${numeral(sellOrderLow - (total.cost + bpPrice.lowest_sell)).format('0[.]0a')} ISK | median ${numeral(sellOrderMed - (total.cost + bpPrice.median_sell)).format('0[.]0a')} ISK\n`);
  return result + '```';
}

function hasAny(bp: any, keys: string[]) {
  for (const key of keys) {
    if (bp[key] > 0) return true;
  }
  return false;
}

function printKeys(bp: any, keys: string[], valueModifier: number, prices: ResourcePrices, total: { cost: number; }) {
  let result = '```\n';
  keys.forEach(key => {
    if (!bp[key]) return;
    const marketItem = prices[key];

    const quantity = Math.ceil(bp[key] * valueModifier);
    result += alignText(startCase(key), quantity);
    if (!marketItem) {
      result += '\n';
      return;
    }
    const price = marketItem.prices[0];
    const cost = price.median_buy * quantity;
    total.cost += cost;
    result += ` [${numeral(price.median_buy).format('0[.]0a')} ISK > ${numeral(cost).format('0[.]0a')} ISK]\n`
  });
  return result + '```';
}

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
]

const salvageKeys = [
  "charredMicroCircuit",
  "friedInterfaceCircuit",
  "trippedPowerCircuit",
  "smashedTriggerUnit",
  "damagedCloseinWeaponSystem",
  "scorchedTelemetryProcessor",
  "contaminatedLorentzFluid",
  "conductivePolymer",
  "contaminatedNaniteCompound",
  "defectiveCurrentPump",
];

function printProduction(bp: any, timeMod: number) {
  let result = '```\n';
  result += alignText('Manufacturing cost', numeral(bp.productionCost).format('0[.]0a') + ' ISK\n');
  result += alignText('Manufacturing time ', printDuration(moment.duration(Math.ceil(bp.productionTime * 1000 * timeMod))) + '\n');
  result += alignText('Runs available',  `${bp.productionCount}\n`);
  return result + '```';
}

function printDuration(duration: any) {
  return `${(duration.days() > 0 ? duration.days() + 'd ' : '')}${
      (duration.hours()).toLocaleString(undefined, {minimumIntegerDigits: 2})}:${
      (duration.minutes()).toLocaleString(undefined, {minimumIntegerDigits: 2})}:${
      (duration.seconds()).toLocaleString(undefined, {minimumIntegerDigits: 2})}`;
}

const column = 25;
function alignText(key: string, value: any) {
  const stringValue = value + '';
  return capitalize(key) + stringValue.padStart(column - key.length + stringValue.length, ' ');
}

function capitalize(str: string) {
  if (typeof str === 'string') {
    return str.replace(/^\w/, c => c.toUpperCase());
  }
  return '';
}

const stdMatPerLvl = 0.06;
const advMatPerLvl = 0.04;
const expMatPerLvl = 0.01;
const timeModPerLvl = [0, 0.05, 0.1, 0.15, 0.2];

function skillModifier(skillLevels: [number?,number?,number?]) {
  
  const stdLvl = skillLevels[0] || 0;
  const advLvl = skillLevels[1] || 0;
  const expLvl = skillLevels[2] || 0;
  
  return {
    material: 1.5 - (stdLvl && stdLvl * stdMatPerLvl || 0)
      - (advLvl && advLvl * advMatPerLvl || 0)
      - (expLvl && expLvl * expMatPerLvl || 0),
    time: 1 - (stdLvl > 0 && timeModPerLvl[stdLvl - 1] || 0)
      - (advLvl > 0 && timeModPerLvl[advLvl - 1] || 0)
      - (expLvl> 0 && timeModPerLvl[expLvl- 1] || 0),
  };
}

async function getResourcePrices() {
  let data: ResourcePrices = {};

  for (const mineral of mineralKeys) {
    const item = await getMarketData(mineral);
    if (!item) continue;
    data[mineral] = item;
  }

  for (const pi of piKeys) {
    const item = await getMarketData(pi);
    if (!item) continue;
    data[pi] = item;
  }

  for (const salvage of salvageKeys) {
    const item = await getMarketData(salvage);
    if (!item) continue;
    data[salvage] = item;
  }

  return data;
}
