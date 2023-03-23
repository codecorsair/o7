import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { startCase } from "lodash";
import moment from "moment";
import numeral from "numeral";
import { getMarketData, getLatestValidPrice } from "../libs/market-api";
import items from "@/data/items.json";
import { Ores, PlanetaryResources, Minerals } from "../constants";
import { EmbedBuilder } from "@discordjs/builders";
import { ICommand } from "@/shared/interfaces/ICommand";

const oreKeys = Object.values(Ores).map((_) => _.toLowerCase());
const mineralKeys = Object.values(Minerals).map((_) => _.toLowerCase());
const piKeys = Object.values(PlanetaryResources).map((_) => _.toLowerCase());

const customKeywords = {
  minerals: { title: "mineral", keys: mineralKeys },
  mineral: { title: "mineral", keys: mineralKeys },
  mins: { title: "mineral", keys: mineralKeys },
  min: { title: "mineral", keys: mineralKeys },
  planetary: { title: "planetary resource", keys: piKeys },
  "planetary items": { title: "planetary resource", keys: piKeys },
  "planetary item": { title: "planetary resource", keys: piKeys },
  pl: { title: "planetary resource", keys: piKeys },
  pi: { title: "planetary resource", keys: piKeys },
  pr: { title: "planetary resource", keys: piKeys },
  "planetary resource": { title: "planetary resource", keys: piKeys },
  "planetary resources": { title: "planetary resource", keys: piKeys },
  ore: { title: "ore", keys: oreKeys },
  ores: { title: "ore", keys: oreKeys },
};

export default {
  aliases: ["pricecheck", "pc"],
  commandBuilder: (alias: string) =>
    new SlashCommandBuilder()
      .setName(alias)
      .setDescription(
        "This command will return market price data which is queried from <https://eve-echoes-market.com>."
      )
      .addStringOption((option) =>
        option
          .setName("item")
          .setDescription("The item to get the price of.")
          .setRequired(true)
      ),
  description: "Get the price of an item.",
  help: {
    title: "Price Check",
    description:
      "This command will return market price data which is queried from <https://eve-echoes-market.com>.",
    examples: [
      {
        args: ["caracal navy"],
        description: "Get the price details for a Caracal Navy Issue.",
      },
      {
        args: ["minerals"],
        description: "Get the prices of all minerals",
      },
      {
        args: ["ore"],
        description: "Get the prices of all ore.",
      },
      {
        args: ["planetary"],
        description: "Get the prices of all planetary resources.",
      },
    ],
  },
  async commandInteraction(interaction: CommandInteraction) {
    await interaction.deferReply();
    const itemName = interaction.options.get("item")?.value as string;
    if (customKeywords[itemName]) {
      const special = customKeywords[itemName];
      let embed = new EmbedBuilder().setTitle(
        `${startCase(special.title)} Prices`
      );
      let counter = 0;
      for (const key of special.keys) {
        const specialItem = await getMarketData(key);
        if (specialItem) {
          const itemInfo = items[specialItem.id];
          const price = getLatestValidPrice(specialItem);
          if (price) {
            embed.addFields([
              {
                name: itemInfo.name,
                value: `**B** ${
                  numeral(price.buy).format("0[.]0a") || "__"
                } *ISK*\n**S** ${
                  numeral(price.sell).format("0[.]0a") || "__"
                } *ISK*\n**V** ${numeral(price.volume).format("0,0") || 0}\n`,
                inline: true,
              },
            ]);
          } else {
            embed.addFields([
              {
                name: startCase(key),
                value: "unknown",
                inline: true,
              },
            ]);
          }
        } else {
          embed.addFields([
            {
              name: startCase(key),
              value: "unknown",
              inline: true,
            },
          ]);
        }
        if (++counter === 24) {
          interaction.reply({ embeds: [embed] });
          embed = new EmbedBuilder();
        }
      }
      if (counter > 0) {
        return interaction.editReply({ embeds: [embed] });
      }
      return;
    }

    try {
      const item = await getMarketData(itemName);
      if (!item) {
        await interaction.editReply(
          `I'm sorry, I wasn't able to find anything for those search terms.`
        );
        return;
      }

      const itemInfo = items[item.id];
      const price = getLatestValidPrice(item);
      if (!price) {
        await interaction.editReply(
          `I'm sorry, I wasn't able to find any prices for ${itemInfo.name}.`
        );
        return;
      }

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(itemInfo.name)
            .setThumbnail(
              `https://storage.googleapis.com/o7-store/icons/${itemInfo.icon_id}.png`
            ).setDescription(`\
**Buy Order** ${numeral(price.buy).format("0[.]0a")}
**Sell Order** ${numeral(price.sell).format("0[.]0a")}
**Volume** ${price.volume || 0}
_last updated ${moment(price.time * 1000).fromNow()}_`),
        ],
      });
      return;
    } catch (err) {
      await interaction.editReply(
        `Oh No! Something went wrong and I was unable to get market data for that item.`
      );
      throw err;
    }
  },
} as ICommand;
