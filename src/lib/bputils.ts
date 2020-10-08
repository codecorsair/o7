import numeral from 'numeral';
import moment from 'moment';
import { startCase } from 'lodash';
import Fuse from 'fuse.js';
import { MessageEmbed } from 'discord.js';
import { getLatestValidPrice, getMarketData } from './market-api';
import { MarketItem } from './market-api';
import blueprints from '../data/blueprints.json';
// import items from '../data/items.json';
// import { Item, getItemId } from './items';

const fuseOpts = {
  includeScore: true,
  threshold: 0.5,
  keys: [
    'name',
    {
      name: 'keywords',
      weight: 2,
    }
  ]
};

const bps = blueprints.map(bp => {
  const name = bp.name;
  const keywords = name.split(' ');
  if (name.endsWith(' iii')) {
    keywords.push('3');
    keywords.push('iii');
  } else if (name.endsWith(' ii')) {
    keywords.push('2');
    keywords.push('ii');
  } else if (name.endsWith(' i')) {
    keywords.push('1');
    keywords.push('i');
  }
  return {
    ...bp,
    name,
    keywords,
  };
});

const fuseIndex = Fuse.createIndex(fuseOpts.keys, bps);
const fuse = new Fuse(bps, fuseOpts, fuseIndex);
// leaving legacy regex here for fast fallback
// const regex = /((?:mk\s?\d)?[a-zA-Z ]+[a-zA-Z](?: [0-9]+(?!\/))?)(?:(?:\s+|\s*-\s*)(\d+(?:\/\d+){1,}))?(?:(?:\s+|\s*-\s*)(\d+(?:\/\d+){1,}))?/;

// new regex developed and tested here https://www.typescriptlang.org/play?ts=4.0.2#code/MYewdgzgLgBApgDwIYFsAOAbOBJMaCusAvDAEQoDWA7DABYgBGMATDAKwD0ADDACzekA3AChhoSLABOcAOaIYJDgAoA-AB4GGfHDSSAlmCgA+ANpIAtAC8AguYBaXcwE4YAXQDUZq7buvVALhgTRycPVQBCAB0OAEoYlRiAgMiIACpE9RQkKAgKPQwMCFNHNjCVf2jg81L3GIBvAEYAGgBfeIz-ZLSMtSRgYBy8gqKqmuSOUY965raEjhFxaBg0JEkIOAATa0kZCAV4ZHQsXAIoADooEAAZEAB3OEkAYSR1pRizrKhgWiVpOQQYiIxOAICAsGcMCAZEoVmtNttdjFhEA
const regex = /([a-zA-Z0-9\- ]+[a-zA-Z\-](?: [0-9]+(?!\/))?)(?:(?:\s*)([0-5]+(?:\/[0-5]+){1,})?)(?:(?:\s*)([0-5]+(?:\/[0-5]+){1,})?)/;

export async function getResponse(searchText: string, isMobile: boolean) {
  const parsedArgs = searchText.toLowerCase().match(regex);
  if (!parsedArgs) return null;
  
  const name = parsedArgs[1].trim();
  const matSkills = parsedArgs[2];
  const acctSkills = parsedArgs[3];
  
  const results = fuse.search(name);
  if (results.length == 0) {
    return null;
  }

  const skillLevels = normalizeSkills(matSkills);
  const accountingLevels = normalizeSkills(acctSkills);

  const mod = skillModifier(skillLevels);
  const accountingRates = accountingSkillModifier(accountingLevels);
  let total = { cost: 0 };

  const bp = results[0].item;
  const bpName = bp.name + ' Blueprint';
  // const id = getItemId(bpName);
  const embed = new MessageEmbed()
    .setColor('#0DE1A1')
    .setTitle(bpName)
    .setDescription(`Type **${bp.type}**\nTech Level **${bp.techLevel}**`);

  if (isMobile) {
    // expand the width of the embed so code blocks aren't squished.
    embed.setAuthor('. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .');
  }

  // if (id) {
  //   const itemInfo = items[id] as Item;
  //   embed.setThumbnail(`https://storage.googleapis.com/o7-store/icons/${itemInfo.icon_id}.png`)
  // }
  
  embed.addField(`Manufacture`, `${bp.type} Skills **${skillLevels.join('/')}**\nMaterial Efficiency **${numeral(mod.material).format('0%')}**\nTime Efficiency **${numeral(mod.time).format('0%')}**`, true)
  embed.addField(`Market`, `Accounting Skills **${accountingLevels.join('/')}**\nBroker's Fee **${numeral(accountingRates.brokersRate).format('0.0%')}**\nTransaction Tax **${numeral(accountingRates.taxRate).format('0%')}**`, true)

  if (hasAny(bp, mineralKeys)) {
    const description = await printKeys(bp, mineralKeys, mod.material, total, isMobile);
    embed.addField('Minerals', description);
  }

  if (hasAny(bp, piKeys)) {
    const description = await printKeys(bp, piKeys, mod.material, total, isMobile);
    embed.addField('Planetary Resources', description);
  }

  if (hasAny(bp, salvageKeys)) {
    const description = await printKeys(bp, salvageKeys, mod.material, total, isMobile);
    embed.addField('Salvage', description);
  }

  embed.addField('Production', printProduction(bp, mod.time, isMobile));
  total.cost += bp.productionCost;

  const itemPrice = await getMarketData(bp.name);
  const bpPrice = await getMarketData(bp.name + ' blueprint');
  if (itemPrice && bpPrice) {
    embed.addField('Cost', printCosts(bp, itemPrice, bpPrice, total, accountingRates, isMobile));
  }
  return embed;
}

function printCosts(bp: { productionCount: number; }, item: MarketItem, blueprint: MarketItem, total: { cost: number }, accountingRates: { brokersRate: number, taxRate: number}, isMobile: boolean) {
  const latestPrice = getLatestValidPrice(item);
  let bpPrice = getLatestValidPrice(blueprint);
  if (!bpPrice) {
    bpPrice = {
      sell: 0,
      lowest_sell: 0,
      buy: 0,
      highest_buy: 0,
      time: 0,
      volume: 0,
    };
  }
  const sellOrderLow = latestPrice && latestPrice.lowest_sell * bp.productionCount || 0;
  const sellOrderMed = latestPrice && latestPrice.sell * bp.productionCount || 0;

  const brokersFeeLow = accountingRates.brokersRate * sellOrderLow || 0;
  const brokersFeeMed = accountingRates.brokersRate * sellOrderMed || 0;
  const taxFeeLow = accountingRates.taxRate * sellOrderLow || 0;
  const taxFeeMed = accountingRates.taxRate * sellOrderMed || 0;
  const brokersFeeAndTaxLow = brokersFeeLow + taxFeeLow;
  const brokersFeeAndTaxMed = brokersFeeMed + taxFeeMed;

  let result = '```\n';
  result += alignText(`Cost to build${isMobile ? '\n' : ''}`, `${numeral(total.cost).format('0[.]0a')} ISK\n`, isMobile);
  result += alignText(`Blueprint Cost${isMobile ? '\n' : ''}`, `low ${numeral(bpPrice.lowest_sell).format('0[.]0a')} ISK | median ${numeral(bpPrice.sell).format('0[.]0a')} ISK\n`, isMobile);
  result += alignText(`Market sell${isMobile ? '\n' : ''}`, `low ${numeral(sellOrderLow).format('0[.]0a')} ISK | median ${numeral(sellOrderMed).format('0[.]0a')} ISK\n`, isMobile);
  result += alignText(`Broker's Fee${isMobile ? '\n' : ''}`, `low ${numeral(brokersFeeLow).format('0[.]0a')} ISK | median ${numeral(brokersFeeMed).format('0[.]0a')} ISK\n`, isMobile);
  result += alignText(`Transaction Tax${isMobile ? '\n' : ''}`, `low ${numeral(taxFeeLow).format('0[.]0a')} ISK | median ${numeral(taxFeeMed).format('0[.]0a')} ISK\n`, isMobile);
  result += alignText(`Profit margin${isMobile ? '\n' : ''}`, `low ${numeral(sellOrderLow - total.cost - brokersFeeAndTaxLow).format('0[.]0a')} ISK | median ${numeral(sellOrderMed - total.cost - brokersFeeAndTaxMed).format('0[.]0a')} ISK\n`, isMobile);
  result += alignText(`(If buying BP)${isMobile ? '\n' : ''}`, `low ${numeral(sellOrderLow - (total.cost + bpPrice.lowest_sell) - brokersFeeAndTaxLow).format('0[.]0a')} ISK | median ${numeral(sellOrderMed - (total.cost + bpPrice.sell) - brokersFeeAndTaxMed).format('0[.]0a')} ISK\n`, isMobile);
  return result + '```';
}

function hasAny(bp: any, keys: string[]) {
  for (const key of keys) {
    if (bp[key] > 0) return true;
  }
  return false;
}

async function printKeys(bp: any, keys: string[], valueModifier: number, total: { cost: number; }, isMobile: boolean) {
  let result = '```\n';
  let groupCost = 0;
  for (const key of keys) {
    if (!bp[key]) {
      continue;
    }
    const marketItem = await getMarketData(key);
    const quantity = Math.ceil(bp[key] * valueModifier);
    result += alignText(startCase(key), numeral(quantity).format('0,0'), isMobile);
    if (!marketItem) {
      result += '\n';
      continue;
    }
    const price = getLatestValidPrice(marketItem);
    const cost = price.buy * quantity;
    groupCost += cost;
    result += `${(isMobile ? '\n' : '')} [${numeral(price.buy).format('0[.]0a')} ISK > ${numeral(cost).format('0[.]0a')} ISK]\n`;
  }
  result += `\n${alignText('Total Cost', (`${numeral(groupCost).format('0[.]0a')} ISK`), isMobile)}`;
  total.cost += groupCost;
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
];

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

function printProduction(bp: any, timeMod: number, isMobile: boolean) {
  let result = '```\n';
  result += alignText('Manufacturing cost', numeral(bp.productionCost).format('0[.]0a') + ' ISK\n', isMobile);
  result += alignText('Manufacturing time ', printDuration(moment.duration(Math.ceil(bp.productionTime * 1000 * timeMod))) + '\n', isMobile);
  result += alignText('Runs available',  `${bp.productionCount}\n`, isMobile);
  return result + '```';
}

function printDuration(duration: any) {
  return `${(duration.days() > 0 ? duration.days() + 'd ' : '')}${
      (duration.hours()).toLocaleString(undefined, {minimumIntegerDigits: 2})}:${
      (duration.minutes()).toLocaleString(undefined, {minimumIntegerDigits: 2})}:${
      (duration.seconds()).toLocaleString(undefined, {minimumIntegerDigits: 2})}`;
}

const column = 20;
function alignText(key: string, value: any, isMobile: boolean) {
  if (isMobile) {
    return capitalize(key) + ' ' + value;
  }
  const stringValue = value + '';
  return capitalize(key) + stringValue.padStart(column - key.length + stringValue.length, ' ');
}

function capitalize(str: string) {
  if (typeof str === 'string') {
    return str.replace(/^\w/, c => c.toUpperCase());
  }
  return '';
}

const baseMaterialEfficiencyRate = 1.5
const baseTimeRate = 1.0
const stdMatPerLvl = 0.06;
const advMatPerLvl = 0.04;
const expMatPerLvl = 0.01;
const timeModPerLvl = [0, 0.05, 0.1, 0.15, 0.2];

function skillModifier(skillLevels: number[]) {
  
  const stdLvl = skillLevels[0] || 0;
  const advLvl = skillLevels[1] || 0;
  const expLvl = skillLevels[2] || 0;
  
  return {
    material: baseMaterialEfficiencyRate - (stdLvl && stdLvl * stdMatPerLvl || 0)
      - (advLvl && advLvl * advMatPerLvl || 0)
      - (expLvl && expLvl * expMatPerLvl || 0),
    time: baseTimeRate - (stdLvl > 0 && timeModPerLvl[stdLvl - 1] || 0)
      - (advLvl > 0 && timeModPerLvl[advLvl - 1] || 0)
      - (expLvl> 0 && timeModPerLvl[expLvl- 1] || 0),
  };
}

const baseBrokersRate = 0.08;
const baseTaxRate = 0.15;
const brokerPerLvl = 0.002;
const stdTaxModPerLvl = [0, 0, 0, 0, 0.01];
const advTaxModPerLvl = [0, 0, 0, 0.01, 0.02];
const expTaxModPerLvl = [0, 0, 0, 0.01, 0.02];

function accountingSkillModifier(accountingSkillLevels: number[]) {
  
  const stdLvl = accountingSkillLevels[0] || 0;
  const advLvl = accountingSkillLevels[1] || 0;
  const expLvl = accountingSkillLevels[2] || 0;
  
  return {
    brokersRate: baseBrokersRate - (stdLvl && stdLvl * brokerPerLvl || 0)
      - (advLvl && advLvl * brokerPerLvl || 0)
      - (expLvl && expLvl * brokerPerLvl || 0),
    taxRate: baseTaxRate - (stdLvl > 0 && stdTaxModPerLvl[stdLvl - 1] || 0)
      - (advLvl > 0 && advTaxModPerLvl[advLvl - 1] || 0)
      - (expLvl> 0 && expTaxModPerLvl[expLvl- 1] || 0),
  };
}

function normalizeSkills(skillsToCheck: string ) {
  const skillLevels = (skillsToCheck && skillsToCheck.split('/').map((s: string) => parseInt(s))) || [0,0,0];
  const stdLvl = skillLevels[0] || 0;
  const advLvl = skillLevels[1] || 0;
  const expLvl = skillLevels[2] || 0;
  return [stdLvl,advLvl,expLvl];
}