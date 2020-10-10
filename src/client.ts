import { Message as DJSMessage } from 'discord.js';
import { processCommand } from './lib/utils/commands';
import { Client } from './lib/types';

const client = new Client();

client.once('ready', () => {
  console.log('ready');
});

client.on('message', (message: DJSMessage) => {
  processCommand(message)
});

export {
  client,
}