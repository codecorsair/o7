import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import numeral from 'numeral';
import items from '../data/items.json';
import {
  getItemId,
  Attributes,
  getAttributeValue,
  Item,
  getItemType,
  omega_icon_id,
  isShip,
  evalFormulae,
  getEHP
} from '../lib/items';
import { romanize } from '../lib/romanize';
// import { isDevModeEnabled } from '../lib/access';

export default class ItemCommand extends Command {
  constructor() {
    super('item', {
      aliases: ['item', 'i'],
      // userPermissions: () => {
      //   if (!isDevModeEnabled()) {
      //     return 'DevModeNotEnabled';
      //   }
      //   return null;
      // },
      args: [
        {
          id: 'name',
          match: 'content'
        }
      ]
    });
  }

  exec(message: Message, args: any) {
    if (!args || !args.name) {
      return message.channel.send(`item name required`);
    }

    const id = getItemId(args.name);
    if (!id) {
      return message.channel.send(`I could not find any item for the search term '${args.name}.'`);
    }

    const itemInfo = items[id] as Item;
    const embed = new MessageEmbed()
      .setThumbnail(`https://storage.googleapis.com/o7-store/icons/${itemInfo.icon_id}.png`)



      const techLevel = getAttributeValue(itemInfo, Attributes.techLevel);
      if (techLevel) {
        embed.setTitle(`TECH LEVEL ${romanize(techLevel)}`);
      }

      if (itemInfo.is_omega) {
        embed.setAuthor(itemInfo.name, `https://storage.googleapis.com/o7-store/icons/${omega_icon_id}.png`);
      } else {
        embed.setAuthor(itemInfo.name);
      }

      if (isShip(itemInfo)) {
        embed.addField(`${itemInfo.faction && itemInfo.faction.toUpperCase() || ''} ${getItemType(itemInfo).toUpperCase()}`,
        `${itemInfo.is_rookie_insurance ? 'Can be insured': 'Insurance ineligible'}`, true);
        embed.addField('Cargo Capacity', `${itemInfo.capacity}m³`, true);
      }

      embed.addField('Description', itemInfo.description);

    if (itemInfo.is_omega) {
      // embed.setFooter('Omega', `https://storage.googleapis.com/o7-store/icons/${omega_icon_id}.png`);
    }

    if (isShip(itemInfo)) {
      for (const bonusGroup of itemInfo.bonus_groups) {
        let bonusText = '';
        for (let i = 0; i < bonusGroup.attributes.attribute_ids.length; ++i) {
          const value = evalFormulae(bonusGroup.attributes.values[i], bonusGroup.attributes.formulae[i]);
          bonusText += ` ${value > 0 ? '+' : ''}${value}${bonusGroup.attributes.units[i]} ${bonusGroup.attributes.names[i]}\n`
        }
        embed.addField(bonusGroup.name, bonusText);
      }

      const a = itemInfo.attributes;

      embed.addField('High Slots', a[Attributes.highSlot].value, true);
      embed.addField('Mid Slots', a[Attributes.medSlot].value, true);
      embed.addField('Low Slots', a[Attributes.lowSlot].value, true);
      embed.addField('Rigs', (a[Attributes.energyRigSlots].value+'/'+a[Attributes.mechanicalRigSlots].value), true);
      embed.addField('Drones', a[Attributes.droneSlotsLeft].value, true);
      embed.addField('Powergrid Output', `${numeral(a[Attributes.powerOutput].value).format('0.0')} MW`, true);

      embed.addField(`DEFENSE ${numeral(getEHP(itemInfo)).format('0,0')}`, `\
        \`\`\`
          | Shield |  Armor |   Hull 
Hitpoints | ${numeral(a[Attributes.shieldCapacity].value).format('0,0').padStart(6)} | ${numeral(a[Attributes.armorHP].value).format('0,0').padStart(6)} | ${numeral(a[Attributes.hp].value).format('0,0').padStart(6)}
EM        | ${numeral(1-a[Attributes.shieldEmDamageResonance].value).format('00.00%')} | ${numeral(1-a[Attributes.armorEmDamageResonance].value).format('00.00%')} | ${numeral(1-a[Attributes.emDamageResonance].value).format('00.00%')}
Thermal   | ${numeral(1-a[Attributes.shieldThermalDamageResonance].value).format('00.00%')} | ${numeral(1-a[Attributes.armorThermalDamageResonance].value).format('00.00%')} | ${numeral(1-a[Attributes.thermalDamageResonance].value).format('00.00%')}
Kinetic   | ${numeral(1-a[Attributes.shieldKineticDamageResonance].value).format('00.00%')} | ${numeral(1-a[Attributes.armorKineticDamageResonance].value).format('00.00%')} | ${numeral(1-a[Attributes.kineticDamageResonance].value).format('00.00%')}
Explosive | ${numeral(1-a[Attributes.shieldExplosiveDamageResonance].value).format('00.00%')} | ${numeral(1-a[Attributes.armorExplosiveDamageResonance].value).format('00.00%')} | ${numeral(1-a[Attributes.explosiveDamageResonance].value).format('00.00%')}
Shield recharge time: ${numeral(a[Attributes.shieldRechargeRate].value / 1000).format('0.0')} seconds\
        \`\`\`
      `);

      const capacitorCapacity = a[Attributes.capacitorCapacity].value;
      const capacitorRechargeTime = a[Attributes.rechargeRate].value / 1000;
      embed.addField('Capacitor', `${numeral(capacitorCapacity).format('0.0')} GJ`, true);
      embed.addField('Recharge Time', `${numeral(capacitorRechargeTime).format('0.0')} S`, true);
      embed.addField('Recharge Rate', `${numeral(((10*capacitorCapacity)/capacitorRechargeTime)*.25).format('0.0[0]')} GJ`, true);

      embed.addField(`Max Locked Targets`, `${a[Attributes.maxLockedTargets].value}`);
      embed.addField(`Sig Radius`, `${a[Attributes.signatureRadius].value + ' m'}`, true);
      embed.addField(`Scan Resolution`,`${(a[Attributes.scanResolution].value + ' km')}`, true);
      embed.addField(`Sensor Strength`,`${a[Attributes.scanRadarStrength].value}`, true);

      embed.addField(`Flight Velocity`,`${a[Attributes.maxVelocity].value} m/s`) 
      embed.addField(`Warp Speed`,`${a[Attributes.warpSpeedMultiplier].value + ' AU/s'}`, true) 
      embed.addField(`Mass`,`${(numeral(a[Attributes.mass].value).format('0,0') + ' kg').padEnd(15)}`, true);
      embed.addField(`Inertia Modifer`,`${a[Attributes.agility].value} x`, true);
    }

    return message.channel.send(embed);
  }
}
