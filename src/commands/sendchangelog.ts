import { MessageEmbed } from 'discord.js';
import { Message, Command } from '../lib/types';
import changelog from '../data/changelog.json';

const command: Command = {
  name: 'send changelog',
  alias: ['sendchangelog'],
  owner: true,
  channel: 'guild',
  args: [{
    name: 'count',
    type: 'number',
    default: 1,
  }],
  handler: (message: Message, args: { count: number; }) => {
    if (message.mentions.channels) {
      message.mentions.channels.forEach(channel => changelog.embeds.slice(changelog.embeds.length - args.count).forEach(e => channel.send(new MessageEmbed(e as any))));
    }

    if (message.mentions.users) {
      message.mentions.users.forEach(user => changelog.embeds.slice(changelog.embeds.length - args.count).forEach(e => user.send(new MessageEmbed(e as any))));
    }
  }
};

export default command;
