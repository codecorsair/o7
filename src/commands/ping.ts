import { Message, CommandDef } from '../lib/types';
import { localize } from '../lib/localize';

const command: CommandDef = {
  name: 'command_ping_name',
  alias: ['ping'],
  owner: true,
  help: {
    description: 'command_ping_help_description',
  },
  handler: (message: Message) => {
    return message.channel.send(localize('command_ping_response', message.lang));
  }
};

export default command;
