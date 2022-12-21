import { Message, CommandDef } from '../lib/types';
import { sendHelp } from './help';

const command: CommandDef = {
  name: 'send help',
  alias: ['sendhelp'],
  owner: true,
  handler: (message: Message) => {
    if (message.mentions.channels) {
      message.mentions.channels.forEach(channel => sendHelp(message.client, message.prefix, channel));
    }

    if (message.mentions.users) {
      message.mentions.users.forEach(user => sendHelp(message.client, message.prefix, user));
    }
  }
};

export default command;
