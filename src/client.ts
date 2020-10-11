import { Message as DJSMessage } from 'discord.js';
import { processCommand } from './lib/utils/commands';
import { Client, Message } from './lib/types';
import * as settings from './lib/settings';
import config from './config.json';

const client = new Client();

client.once('ready', () => {
  console.log('ready');
});

client.on('message', async (djsMessage: DJSMessage) => {
  const message = djsMessage as Message;

  const prefix = getPrefix(djsMessage);
  if (djsMessage.author.bot || !message.content.startsWith(prefix)) return;
  message.prefix = prefix;
  const content = message.content.slice(message.prefix.length).trim();
  if (await processCommand(message, client, content)) return;
});

function getPrefix(message: DJSMessage) {
  if (message.guild) {
    const prefix = settings.getSettings(message.guild.id).prefix;
    (message as any).prefix = prefix;
    return prefix;
  }
  (message as any).prefix = config.prefix;
  return config.prefix;
}

export {
  client,
}