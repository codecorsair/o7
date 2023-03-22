import { Message, CommandDef } from '../lib/types';

const command: CommandDef = {
  name: 'ping',
  alias: ['ping', 'p'],
  owner: true,
  handler: (message: Message) => {
    return message.channel.send('Pong.');
  }
};

export default command;
