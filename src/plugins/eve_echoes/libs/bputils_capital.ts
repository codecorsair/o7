import numeral from 'numeral';
import moment from 'moment';
import { startCase } from 'lodash';
import Fuse from 'fuse.js';
import { EmbedBuilder } from 'discord.js';
import { getLatestValidPrice, getMarketData } from './market-api';
import { MarketItem } from './market-api';
import blueprints_capital from '@/data/bot/blueprints_capital.json';
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

const bps_capital = blueprints_capital.map(bp => {
  const name = bp.name;
  const keywords = name.split(' ');
  if (name.endsWith(' iv')) {
    keywords.push('4');
    keywords.push('iv');
  } else if (name.endsWith(' iii')) {
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

const fuseCapitalIndex = Fuse.createIndex(fuseOpts.keys, bps_capital);
const fuseCapital = new Fuse(bps_capital, fuseOpts, fuseCapitalIndex);
// leaving legacy regex here for fast fallback
// const regex = /((?:mk\s?\d)?[a-zA-Z ]+[a-zA-Z](?: [0-9]+(?!\/))?)(?:(?:\s+|\s*-\s*)(\d+(?:\/\d+){1,}))?(?:(?:\s+|\s*-\s*)(\d+(?:\/\d+){1,}))?/;

// new regex developed and tested here https://www.typescriptlang.org/play?ts=4.0.2#code/MYewdgzgLgBApgDwIYFsAOAbOBJMaCusAvDAEQoDWA7DABYgBGMATDAKwD0ADDACzekA3AChhoSLABOcAOaIYJDgAoA-AB4GGfHDSSAlmCgA+ANpIAtAC8AguYBaXcwE4YAXQDUZq7buvVALhgTRycPVQBCAB0OAEoYlRiAgMiIACpE9RQkKAgKPQwMCFNHNjCVf2jg81L3GIBvAEYAGgBfeIz-ZLSMtSRgYBy8gqKqmuSOUY965raEjhFxaBg0JEkIOAATa0kZCAV4ZHQsXAIoADooEAAZEAB3OEkAYSR1pRizrKhgWiVpOQQYiIxOAICAsGcMCAZEoVmtNttdjFhEA
const regex = /([a-zA-Z0-9\- ]+[a-zA-Z\-](?: [0-9]+(?!\/))?)(?:(?:\s*)([0-5]+(?:\/[0-5]+){1,})?)(?:(?:\s*)([0-5]+(?:\/[0-5]+){1,})?)/;


export async function getCapitalResponseList(searchText: string): Promise<string[] | null> {
  const parsedArgs = searchText.toLowerCase().match(regex);
  if (!parsedArgs) return null;

  var name = parsedArgs[1].trim();

  const resultsFuse = fuseCapital.search(name);

  if (resultsFuse.length == 0) {
    return null;
  }

  let results: string[] = [];
  let nameMulti: string[] = name.split(' ');

  for (let i = 0; i < resultsFuse.length; i++) {
    for (let j = 0; j < nameMulti.length; j++) {
      if (resultsFuse[i].item.name.toLowerCase().includes(nameMulti[j])) {
        results.push(resultsFuse[i].item.name);
      }
    }
  }

  if (results.length == 0) {
    return null;
  }

  return (results);

}


export async function getResponseCapital(searchText: string, isMobile: boolean) {
  const parsedArgs = searchText.toLowerCase().match(regex);
  if (!parsedArgs) return null;
  
  let name = parsedArgs[1].trim();
  const matSkills = parsedArgs[2];
  const acctSkills = parsedArgs[3];
  // Convert decimal number to roman number
  let nameSplitter = name.split(' ') ;
  name = "" ;

  nameSplitter.forEach(item =>
    {
      item = convertNumberToRoman(item) ;
      if (name != "")
      {
        name += " " ;
      }

      name += item.toLocaleLowerCase() ;
    })

  const resultsFuse = fuseCapital.search(name);

  // No results
  if (resultsFuse.length == 0) {
    return null;
  }

  let results: any[] = [];
  let nameMulti: string[] = name.split(' ');

  for (let i = 0; i < resultsFuse.length; i++) {
    let numberofValidArgs = 0;

    for (let j = 0; j < nameMulti.length; j++) {
      if (resultsFuse[i].item.name.toLowerCase().includes(nameMulti[j])) {
        numberofValidArgs++;
      }
    }

    if (numberofValidArgs >= nameMulti.length) {
      results.push(resultsFuse[i].item);
    }

    if (resultsFuse[i].item.name.toLowerCase() == name.toLowerCase())
    {
      results = [] ;
      results.push(resultsFuse[i].item) ;
      break ;
    }
  }




  // No results
  if (results.length == 0) {
    return null;
  }
  // Too many results
  else if (results.length > 10) {
    let listItem = "";

    results.forEach(item => {
      listItem += "- " + item.name + "\n";
    });

    const embed = new EmbedBuilder()
      .setTitle(`Too many results ...`)
      .setDescription(`I don't found any item with this word ... Did you mean :` + "\n" + listItem);

    return embed;
  }

  const skillLevels = normalizeSkills(matSkills);
  const accountingLevels = normalizeSkills(acctSkills);

  const mod = skillModifier(skillLevels);
  const accountingRates = accountingSkillModifier(accountingLevels);
  let total = { cost: 0 };

  const bp = results[0];

  const bpName = bp.name + ' Blueprint';
  // const id = getItemId(bpName);
  const embed = new EmbedBuilder()
    .setColor('#0DE1A1')
    .setTitle(bpName)
    .setDescription(`Type **${bp.type}**\nTech Level **${bp.techLevel}**`);

  if (isMobile) {
    // expand the width of the embed so code blocks aren't squished.
    embed.addFields({
      name: '\u200b',
      value: '. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .',
      inline: false
    })
  }

  // if (id) {
  //   const itemInfo = items[id] as Item;
  //   embed.setThumbnail(`https://storage.googleapis.com/o7-store/icons/${itemInfo.icon_id}.png`)
  // }
  
  embed.addFields([{
    name: `Manufacture`, value: `${bp.type} Skills **${skillLevels.join('/')}**\nMaterial Efficiency **${numeral(mod.material).format('0%')}**\nTime Efficiency **${numeral(mod.time).format('0%')}**`, inline: true
  }])
  embed.addFields([{
    name: `Market`, value: `Accounting Skills **${accountingLevels.join('/')}**\nBroker's Fee **${numeral(accountingRates.brokersRate).format('0.0%')}**\nTransaction Tax **${numeral(accountingRates.taxRate).format('0%')}**`, inline: true
  }])

  if (hasAny(bp, componentKeys)) {
    const description = await printKeys(bp, componentKeys, mod.material, total, isMobile);
    embed.addFields([{
      name: 'Components', value: description, inline: false
    }]);
  }

  embed.addFields([{
    name: 'Production', value: printProduction(bp, mod.time, isMobile), inline: false
  }]);
  total.cost += bp.productionCost;

  const itemPrice = await getMarketData(bp.name);
  const bpPrice = await getMarketData(bp.name + ' blueprint');
  if (itemPrice && bpPrice) {
    embed.addFields([{
      name: 'Cost', value: printCosts(bp, itemPrice, bpPrice, total, accountingRates, isMobile), inline: false
    }]);
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


const componentKeys = [
  "capitalShipMaintenanceBay",
  "capitalCapacitorBattery",
  "capitalPowerGenerator",
  "capitalLauncherHardpoint",
  "capitalArmorPlates",
  "capitalSensorCluster",
  "capitalShieldEmitter",
  "capitalSiegeArray",
  "capitalCargoBay",
  "capitalComputerSystem",
  "capitalConstructionParts",
  "capitalCloneVatBay",
  "capitalCorporateHangarBay",
  "capitalDoomsdayWeaponMount",
  "capitalTurretHardpoint",
  "capitalJumpBridgeArray",
  "capitalJumpDrive",
  "capitalPropulsionEngine",
  "capitalDroneBay"
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

const column = 30;
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

function convertNumberToRoman(decimalNumber: string) : string
{
  let romanNumber = "" ;

  switch (decimalNumber)
  {
    default:
      romanNumber = decimalNumber;
      break;

    case '1':
      romanNumber = 'I'
      break;

    case '2':
      romanNumber = 'II'
      break;

    case '3':
      romanNumber = 'III'
      break;

    case '4':
      romanNumber = 'IV'
      break;

    case '5':
      romanNumber = 'V'
      break;

    case '6':
      romanNumber = 'VI'
      break;

    case '7':
      romanNumber = 'VII'
      break;

    case '8':
      romanNumber = 'VIII'
      break;

    case '9':
      romanNumber = 'IX'
      break;

    case '10':
      romanNumber = 'X'
      break;
  }

  return romanNumber ;
}
