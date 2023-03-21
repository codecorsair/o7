// import { Message as DJSMessage } from 'discord.js';
// import { processCommand } from './lib/utils/commands';
import { Client } from "./lib/types";
// import { Message } from './lib/types';
// import * as settings from './lib/settings';
// import config from './config.json';

const client = new Client();

client.once("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("guildCreate", async (guild) => {
  const guildCount = await client.shard.fetchClientValues("guilds.cache.size");
  console.log(
    `Joined guild ${guild.name} (${guild.id}) [Total: ${guildCount}]`
  );
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isAutocomplete())
    return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    if (interaction.isChatInputCommand()) {
      return await command.execute(interaction);
    } else if (interaction.isAutocomplete() && command.autocomplete) {
      return await command.autocomplete(interaction);
    }
  } catch (error) {
    console.error(error);
  }
});

// client.on('message', async (djsMessage: DJSMessage) => {
//   const message = djsMessage as Message;

//   const prefix = getPrefix(djsMessage);
//   if (djsMessage.author.bot || !message.content.startsWith(prefix)) return;
//   message.prefix = prefix;
//   const content = message.content.slice(message.prefix.length).trim();
//   if (await processCommand(message, client, content, message.prefix)) return;
// });

// function getPrefix(message: DJSMessage) {
//   if (message.guild) {
//     const prefix = settings.getSettings(message.guild.id).prefix;
//     (message as any).prefix = prefix;
//     return prefix;
//   }
//   (message as any).prefix = config.prefix;
//   return config.prefix;
// }

export { client };
