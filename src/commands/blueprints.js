import { MessageEmbed } from 'discord.js';
import { Command } from 'discord-akairo';
import Fuse from 'fuse.js';
import numeral from 'numeral';
import moment from 'moment';

import blueprints from '../data/blueprints.json';


const fuseOptions = {
  isCaseSensitive: false,
  shouldSort: true,
  includeScore: true,
  ignoreLocation: true,
  useExtendedSearch: true,
  includeMatches: false,
  findAllMatches: false,
  minMatchCharLength: 1,
  location: 0,
  threshold: 0.6,
  distance: 100,
  useExtendedSearch: false,
  ignoreLocation: false,
  ignoreFieldNorm: true,
  sort: (a, b) => a.score - b.score,
  keys: [
    'name',
    {
      name: 'keywords',
      weight: 2,
    }
  ]
}



export default class PingCommand extends Command {

  constructor() {
    super('blueprint', {
      aliases: ['bp'],
      args: [
        {
          id: 'name',
          match: 'content',
          default: '',
        }
      ],
    });

    const bps = blueprints.map(bp => {
      bp.keywords = bp.name.split(' ');
      if (bp.name.endsWith(' III')) {
        bp.keywords.push('3');
      } else if (bp.name.endsWith(' II')) {
        bp.keywords.push('2');
      } else if (bp.name.endsWith(' I')) {
        bp.keywords.push('1');
      }
      return bp;
    });
    this.fuse = new Fuse(bps, fuseOptions);
  }

  exec(message, args) {
    const results = this.fuse.search(args.name);
    if (results.length == 0) {
      return message.reply(`No blueprint found for search term \`${args.name}\`!`);
    }

    const bp = results[0].item;
    let embed = new MessageEmbed()
      .setColor('#0DE1A1')
      .setTitle(bp.name)
      .setDescription(`Type **${bp.type}**\nTech Level **${bp.techLevel}**`);
    if (hasAny(bp, mineralKeys)) {
      embed = embed.addField('Minerals', printKeys(bp, mineralKeys));
    }

    if (hasAny(bp, piKeys)) {
      embed = embed.addField('Planetary Resources', printKeys(bp, piKeys));
    }

    if (hasAny(bp, salvageKeys)) {
      embed = embed.addField('Salvage', printKeys(bp, salvageKeys));
    }

    embed = embed.addField('Production', printProduction(bp));
    return message.reply(embed);
  }
}

function hasAny(bp, keys) {
  for (const key of keys) {
    if (bp[key] > 0) return true;
  }
  return false;
}

function printKeys(bp, keys) {
  let result = '```\n';
  keys.forEach(key => bp[key] && (result += alignText(key, bp[key])))
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

function printProduction(bp) {
  let result = '```\n';
  result += numeral(bp.productionCost).format('0[.]0a') + ' ISK\n';
  result += moment.duration(bp.productionTime * 1000).humanize() + '\n';
  result += `Runs ${bp.productionCount}\n`
  return result + '```';
}

const column = 25;
function alignText(key, value) {
  const stringValue = value + '';
  return capitalize(key) + stringValue.padStart(column - key.length + stringValue.length, ' ') + '\n';
}

function capitalize(str) {
  if (typeof str === 'string') {
    return str.replace(/^\w/, c => c.toUpperCase());
  }
  return '';
}
