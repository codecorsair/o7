import { Message, Command } from '../lib/types';

const command: Command = {
  name: 'ping',
  alias: ['ping', 'p'],
  owner: true,
  handler: (message: Message) => {
    return message.channel.send('Pong.');
  }
};

export default command;
