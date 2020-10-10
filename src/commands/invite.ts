import { Message, Command } from '../lib/types';

const command: Command = {
  name: 'invite',
  alias: ['invite', 'botinvite'],
  handler: (message: Message) => {
    return message.channel.send('<https://discord.com/oauth2/authorize?client_id=753820564665270333&scope=bot&permissions=3072>');
  }
};

export default command;
