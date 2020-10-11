import { MessageEmbed } from 'discord.js';
import { Message, CommandDef } from '../lib/types';

const command: CommandDef = {
  name: 'status',
  alias: ['status'],
  owner: true,
  handler: (message: Message) => {
    return message.channel.send(new MessageEmbed()
      .setTitle('Bot Status')
      .setDescription(`Active Guilds  ${message.client.guilds.cache.size}`));
  }
};

export default command;
