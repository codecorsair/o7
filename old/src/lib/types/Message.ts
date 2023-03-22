import { Message as DJSMessage } from 'discord.js';
// import { Client } from './'

export interface Message extends DJSMessage {
  prefix: string;
  sendHelp: () => any;
  // client: Client;
}
