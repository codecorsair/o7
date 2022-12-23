import marketItems from "../data/market-items.json";
import numeral from 'numeral';
import items from "../data/items.json";
import {
  Attributes,
  evalFormulae,
  getAttributeValue,
  getEHP,
  getItemType,
  isShip,
  Item,
  omega_icon_id,
} from "../lib/items";
import { romanize } from "../lib/romanize";
import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import { Command } from "../lib/types/Command";

const ITEM_CHOICES = marketItems.map((item) => ({
  name: item.name,
  value: String(item.id),
}));

export default {
  data: new SlashCommandBuilder()
    .setName("item")
    .setDescription("Get information about an item in game.")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("The item to get information about.")
        .setRequired(true)),
  help: {
    description: "This command will return information about an item in game.",
  },
  async autocomplete(interaction: AutocompleteInteraction) {
    const itemName = interaction.options.getFocused(true);

    const choices = ITEM_CHOICES.filter((choice) => choice.name.includes(itemName.value));

    console.log(choices);
    await interaction.respond(choices.slice(0, 25));
  },
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    const id = interaction.options.get("item");
    if (!id) {
      return interaction.editReply("You must provide an item to search for.");
    }
    const itemInfo = items[id.value as number] as Item;
    if (!itemInfo) {
      return interaction.editReply(`I could not find any item for the search term`);
    }

    const embed = new EmbedBuilder().setThumbnail(
      `https://storage.googleapis.com/o7-store/icons/${itemInfo.icon_id}.png`
    );

    const techLevel = getAttributeValue(itemInfo, Attributes.techLevel);
    if (techLevel) {
      embed.setTitle(`TECH LEVEL ${romanize(techLevel)}`);
    }

    if (itemInfo.is_omega) {
      embed.setTitle(itemInfo.name);
      embed.setImage(
        `https://storage.googleapis.com/o7-store/icons/${omega_icon_id}.png`
      );
    } else {
      embed.setTitle(itemInfo.name);
    }

    if (isShip(itemInfo)) {
      embed.addFields([
        {
          name: `${
            (itemInfo.faction && itemInfo.faction.toUpperCase()) || ""
          } ${getItemType(itemInfo).toUpperCase()}`,
          value: `${
            itemInfo.is_rookie_insurance
              ? "Can be insured"
              : "Insurance ineligible"
          }`,
          inline: true,
        },
        {
          name: "Cargo Capacity",
          value: `${itemInfo.capacity}m³`,
          inline: true,
        },
      ]);
    }

    embed.addFields([
      { name: "Description", value: itemInfo.description, inline: false },
    ]);

    if (itemInfo.is_omega) {
      // embed.setFooter('Omega', `https://storage.googleapis.com/o7-store/icons/${omega_icon_id}.png`);
    }

    if (isShip(itemInfo)) {
      for (const bonusGroup of itemInfo.bonus_groups) {
        let bonusText = "";
        for (let i = 0; i < bonusGroup.attributes.attribute_ids.length; ++i) {
          const value = evalFormulae(
            bonusGroup.attributes.values[i],
            bonusGroup.attributes.formulae[i]
          );
          bonusText += ` ${value > 0 ? "+" : ""}${value}${
            bonusGroup.attributes.units[i]
          } ${bonusGroup.attributes.names[i]}\n`;
        }
        embed.addFields([
          { name: bonusGroup.name, value: bonusText, inline: false },
        ]);
      }

      const a = itemInfo.attributes;
      const capacitorCapacity = a[Attributes.capacitorCapacity].value;
      const capacitorRechargeTime = a[Attributes.rechargeRate].value / 1000;

      embed.addFields([
        {
          name: "High Slots",
          value: String(a[Attributes.highSlot].value),
          inline: true,
        },
        {
          name: "Mid Slots",
          value: String(a[Attributes.medSlot].value),
          inline: true,
        },
        {
          name: "Low Slots",
          value: String(a[Attributes.lowSlot].value),
          inline: true,
        },
        {
          name: "Rigs",
          value: `${a[Attributes.energyRigSlots].value}/${
            a[Attributes.mechanicalRigSlots].value
          }`,
          inline: true,
        },
        {
          name: "Drones",
          value: String(a[Attributes.droneSlotsLeft].value),
          inline: true,
        },
        {
          name: "Powergrid Output",
          value: `${a[Attributes.powerOutput].value} MW`,
          inline: true,
        },
        {
          name: `DEFENSE ${numeral(getEHP(itemInfo)).format("0,0")}`,
          value: `\
                 \`\`\`
                  | Shield |  Armor |   Hull 
        Hitpoints | ${numeral(a[Attributes.shieldCapacity].value)
          .format("0,0")
          .padStart(6)} | ${numeral(a[Attributes.armorHP].value)
            .format("0,0")
            .padStart(6)} | ${numeral(a[Attributes.hp].value)
            .format("0,0")
            .padStart(6)}
        EM        | ${numeral(
          1 - a[Attributes.shieldEmDamageResonance].value
        ).format("00.00%")} | ${numeral(
            1 - a[Attributes.armorEmDamageResonance].value
          ).format("00.00%")} | ${numeral(
            1 - a[Attributes.emDamageResonance].value
          ).format("00.00%")}
        Thermal   | ${numeral(
          1 - a[Attributes.shieldThermalDamageResonance].value
        ).format("00.00%")} | ${numeral(
            1 - a[Attributes.armorThermalDamageResonance].value
          ).format("00.00%")} | ${numeral(
            1 - a[Attributes.thermalDamageResonance].value
          ).format("00.00%")}
        Kinetic   | ${numeral(
          1 - a[Attributes.shieldKineticDamageResonance].value
        ).format("00.00%")} | ${numeral(
            1 - a[Attributes.armorKineticDamageResonance].value
          ).format("00.00%")} | ${numeral(
            1 - a[Attributes.kineticDamageResonance].value
          ).format("00.00%")}
        Explosive | ${numeral(
          1 - a[Attributes.shieldExplosiveDamageResonance].value
        ).format("00.00%")} | ${numeral(
            1 - a[Attributes.armorExplosiveDamageResonance].value
          ).format("00.00%")} | ${numeral(
            1 - a[Attributes.explosiveDamageResonance].value
          ).format("00.00%")}
        Shield recharge time: ${numeral(
          a[Attributes.shieldRechargeRate].value / 1000
        ).format("0.0")} seconds\
        \`\`\`
        `,
          inline: false,
        },
        {
          name: "Capacitor",
          value: `${numeral(capacitorCapacity).format("0.0")} GJ`,
          inline: true,
        },
        {
          name: "Recharge Time",
          value: `${numeral(capacitorRechargeTime).format("0.0")} S`,
          inline: true,
        },
        {
          name: "Recharge Rate",
          value: `${numeral(
            ((10 * capacitorCapacity) / capacitorRechargeTime) * 0.25
          ).format("0.0[0]")} GJ`,
          inline: true,
        },
        {
          name: `Max Locked Targets`,
          value: `${a[Attributes.maxLockedTargets].value}`,
          inline: true,
        },
        {
          name: `Sig Radius`,
          value: `${a[Attributes.signatureRadius].value + " m"}`,
          inline: true,
        },
        {
          name: `Scan Resolution`,
          value: `${a[Attributes.scanResolution].value + " km"}`,
          inline: true,
        },
        {
          name: `Sensor Strength`,
          value: `${a[Attributes.scanRadarStrength].value}`,
          inline: true,
        },
        {
          name: "Flight Velocity",
          value: `${a[Attributes.maxVelocity].value} m/s`,
          inline: true,
        },
        {
          name: "Warp Speed",
          value: `${a[Attributes.warpSpeedMultiplier].value} AU/s`,
          inline: true,
        },
        { name: "Mass", value: `${a[Attributes.mass].value} kg`, inline: true },
        {
          name: "Inertia Modifier",
          value: `${a[Attributes.agility].value}`,
          inline: true,
        },
      ]);
    }

    return interaction.editReply({ embeds: [embed] });
  },
} as Command;
