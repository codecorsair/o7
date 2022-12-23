// import { Message as DJSMessage } from 'discord.js';
// import { processCommand } from './lib/utils/commands';
import { Client } from './lib/types';
// import { Message } from './lib/types';
// import * as settings from './lib/settings';
// import config from './config.json';

const client = new Client();

client.once('ready', () => {
  client.application?.commands.set(client.commands.map(c => c.data));
  console.log('ready');
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) {
        await command.execute(interaction);
      }
    } else if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (command && command.autocomplete) {
        await command.autocomplete(interaction);
      }
    }
  } catch (error) {
    console.error(error);
    if (!interaction.isCommand()) return;
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
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

export {
  client,
}