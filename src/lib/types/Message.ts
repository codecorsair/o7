import { Message as DJSMessage } from 'discord.js';
import { LANG } from '../localize';
import { Client } from './'

export interface Message extends DJSMessage {
  prefix: string;
  lang: LANG;
  sendHelp: () => any;
  client: Client;
}
