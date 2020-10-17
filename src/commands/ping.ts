import { Message, CommandDef } from '../lib/types';
import { localize } from '../lib/localize';

const command: CommandDef = {
  name: 'command_name_ping',
  alias: ['command_alias_ping', 'command_alias_p'],
  owner: true,
  help: {
    description: 'command_help_description_ping',
  },
  handler: (message: Message) => {
    return message.channel.send(localize('command_ping_response', message.lang));
  }
};

export default command;
