import Fuse from 'fuse.js';
import items from '../data/market-items.json';

const fuseOptions = {
  isCaseSensitive: false,
  shouldSort: true,
  includeScore: true,
  ignoreLocation: true,
  includeMatches: false,
  findAllMatches: false,
  minMatchCharLength: 1,
  threshold: 0.2,
  useExtendedSearch: false,
  // ignoreFieldNorm: true,
  sort: (a: { score: number }, b: { score: number }) => a.score - b.score,
  keys: [
    'name',
    {
      name: 'keywords',
      weight: 3,
    }
  ]
}

const processedItems = items.map(item => {
  const name = item.name;
  const keywords = name.split(' ');
  if (name.endsWith(' iii')) {
    keywords.push('3');
  } else if (name.endsWith(' ii')) {
    keywords.push('2');
  } else if (name.endsWith(' i')) {
    keywords.push('1');
  }
  return  {
    ...item,
    keywords,
  }
});

const marketIndex = Fuse.createIndex(fuseOptions.keys, processedItems);
const fuse = new Fuse(processedItems, fuseOptions, marketIndex);

export function getItemId(searchTerms: string) {
  const results = fuse.search(searchTerms);
  if (results.length == 0) {
    return null;
  }
  return results[0].item.id;
}

export function getAttributeValue(item: Item, attr: Attributes) {
  if (!item.attributes) return null;
  return item.attributes[attr]?.value || null;
}

export const omega_icon_id = 28007000050;


export const itemCategory = {
  basicFrigate: 'Basic Frigate',
  frigate: 'Frigate',
  interceptor: 'Interceptor',
  assaultFrigate: 'Assault Frigate',
  covertOpsFrigate: 'Covert Ops Frigate',
  stealthBomber: 'Stealth Bomber',
  logisticsFrigate: 'Logistics Frigate',
  destroyer: 'Destroyer',
  commandDestroyer: 'Command Destroyer',
  tacticalDestroyer: 'Tactical Destroyer',
  cruiser: 'Cruiser',
  forceRecon: 'Force Recon',
  heavyAssaultCruiser: 'Heavy Assault Cruiser',
  battlecruiser: 'Battlecruiser',
  assaultBattlecruiser: 'Assault Battlecruiser',
  logisticsBattlecruiser: 'Logistics Battlecruiser',
  forceFieldBattlecruiser: 'Force Field Battlecruiser',
  transportShip: 'Transport Ship',
  expeditionFrigate: 'Expedition Frigate',
  miningBarge: 'Mining Barge',
  battleship: 'Battleship',
  plex: 'Pilot Service',
  skillChip: 'Skill Chip',

  // Modules
  smallPulseLaser: 'Small Pulse Laser',

  itemNotComplete: '<ITEM TYPE>',
}

export function getItemType(item: { market_group_id?: number; }) {
  if (!item.market_group_id) return itemCategory.itemNotComplete;
  switch (item.market_group_id) {
    // Pilot Service
    case 300000000: return itemCategory.plex;
    case 300001000: return itemCategory.skillChip;
    // Ships
    case 100000000: return itemCategory.basicFrigate;
    case 100000002: return itemCategory.frigate;
    case 100000004: return itemCategory.interceptor;
    case 100000006: return itemCategory.assaultFrigate;
    case 100000008: return itemCategory.covertOpsFrigate;
    case 100000010: return itemCategory.stealthBomber;
    case 100000014: return itemCategory.logisticsFrigate;
    case 100001000: return itemCategory.destroyer;
    case 100001004: return itemCategory.commandDestroyer;
    case 100001006: return itemCategory.tacticalDestroyer;
    case 100002000: return itemCategory.cruiser;
    case 100002004: return itemCategory.forceRecon;
    case 100002006: return itemCategory.heavyAssaultCruiser;
    case 100003000: return itemCategory.battlecruiser;
    case 100003002: return itemCategory.assaultBattlecruiser;
    case 100003006: return itemCategory.logisticsBattlecruiser;
    case 100003008: return itemCategory.forceFieldBattlecruiser;
    case 100004000: return itemCategory.transportShip;
    case 100004002: return itemCategory.expeditionFrigate;
    case 100004004: return itemCategory.miningBarge;
    case 100005000: return itemCategory.battleship;
    // Modules - High
    case 101000000: return itemCategory.smallPulseLaser;

  }
  return itemCategory.itemNotComplete;
}

export function isShip(item: Item) {
  return !!item.ship_bonus_code_list;
}

export function evalFormulae(value: number, formulae: string) {
  return eval(formulae.replace('A', value + ''));
}

export function getEHP(item: Item) {
  return Math.ceil((item.attributes[Attributes.shieldCapacity].value/(1 - (Math.min(item.attributes[Attributes.shieldEmDamageResonance].value, item.attributes[Attributes.shieldExplosiveDamageResonance].value, item.attributes[Attributes.shieldKineticDamageResonance].value, item.attributes[Attributes.shieldThermalDamageResonance].value)))) +
  (item.attributes[Attributes.armorHP].value/(1 - (Math.min(item.attributes[Attributes.armorEmDamageResonance].value, item.attributes[Attributes.armorExplosiveDamageResonance].value, item.attributes[Attributes.armorKineticDamageResonance].value, item.attributes[Attributes.armorThermalDamageResonance].value)))) +
  (item.attributes[Attributes.hp].value/(1 - (Math.min(item.attributes[Attributes.emDamageResonance].value, item.attributes[Attributes.explosiveDamageResonance].value, item.attributes[Attributes.kineticDamageResonance].value, item.attributes[Attributes.thermalDamageResonance].value)))));
}

interface CHItem {
  ability_list: number[];
  base_drop_rate: number,
  base_price: number,
  can_be_jettisoned: boolean,
  capacity: number,
  faction_id: number;
  lock_skin: string[];
  graphic_id: number;
  icon_id: number;
  is_omega: number;
  main_cal_code: string;
  npc_cal_codes: string[];
  market_group_id: number;
  mass: number;
  normal_debris: number[];
  prefab_id: number;
  race_id: number;
  radius: number;
  ship_bonus_code_list:  string[];
  ship_bonus_skill_list: number[];
  sof_faction_name:  string;
  sound_id: number;
  volume: number;
  wreck_id: number;
  zh_desc:  string;
  zh_name: string;
}

export type Item = Partial<CHItem> & {
  name: string;
  description: string;
  item_id: string;
  faction: string;
  is_rookie_insurance: number;
  attributes: {
    [id: string]: { value: number; name: string; }
  };
  bonus_groups: {
    name: string;
    attributes: {
      attribute_ids: number[];
      names: string[];
      values: number[];
      units: string[];
      formulae: string[];
    }
  }[];
  order: number;
};

export enum Attributes {
  techLevel = 1,
  shipSize = 2,
  metaLevel = 4,
  mass = 100,
  radius = 105,
  volume = 106,
  agility = 120,
  maxVelocity = 130,
  warpSpeedMultiplier = 150,
  highSlot = 164,
  medSlot = 166,
  lowSlot = 168,
  mechanicalRigSlots = 170,
  energyRigSlots = 172,
  powerOutput = 180,
  shieldCapacity = 200,
  shieldCharge = 203,
  shieldEmDamageResonance = 211,
  shieldThermalDamageResonance = 212,
  shieldKineticDamageResonance = 213,
  shieldExplosiveDamageResonance = 214,
  shieldRechargeRate = 228,
  armorHP = 230,
  armorDamage = 233,
  armorEmDamageResonance = 241,
  armorThermalDamageResonance = 242,
  armorKineticDamageResonance = 243,
  armorExplosiveDamageResonance = 244,
  hp = 260,
  damage = 263,
  emDamageResonance = 271,
  thermalDamageResonance = 272,
  kineticDamageResonance = 273,
  explosiveDamageResonance = 274,
  capacitorCapacity = 300,
  charge = 303,
  rechargeRate = 304,
  warpCapacitorNeed = 312,
  scanRadarStrength = 334,
  maxTargetRange = 350,
  scanResolution = 352,
  maxLockedTargets = 354,
  signatureRadius = 360,
  droneBandwidth = 480,
  droneCapacity = 481,
  tempHPMaxEnergy = 511,
  tempHPCurEnergy = 512,
  tempHPMaxShield = 513,
  tempHPCurShield = 514,
  tempHPMaxArmor = 515,
  tempHPCurArmor = 516,
  capacity = 620,
  specialOreHoldCapacity = 622,
  specialMineralHoldCapacity = 623,
  specialFacilityHoldCapacity = 624,
  FuelRemain = 655,
  specialFuelBayCapacity = 10038,
  shipMaintenanceBayCapacity = 10039,
  fleetHangarCapacity = 10040,
  specialGasHoldCapacity = 10042,
  specialSalvageHoldCapacity = 10043,
  specialShipHoldCapacity = 10044,
  specialSmallShipHoldCapacity = 10045,
  specialMediumShipHoldCapacity = 10046,
  specialLargeShipHoldCapacity = 10047,
  specialIndustrialShipHoldCapacity = 10048,
  specialAmmoHoldCapacity = 10049,
  specialBoosterHoldCapacity = 10050,
  specialCorpseHoldCapacity = 10051,
  specialQuafeHoldCapacity = 10053,
  specialCommandCenterHoldCapacity = 10054,
  specialSubsystemHoldCapacity = 10055,
  specialPlanetaryCommoditiesHoldCapacity = 10056,
  fighterCapacity = 10057,
  logisticsCapacity = 10103,
  droneSlotsLeft = 10104,
}
