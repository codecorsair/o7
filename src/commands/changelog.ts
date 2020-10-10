import { MessageEmbed } from 'discord.js';
import { Message, Command } from '../lib/types';
import changelog from '../data/changelog.json';

const command: Command = {
  name: 'changelog',
  alias: ['changelog'],
  owner: true,
  args: [{
    name: 'count',
    type: 'number',
  }],
  handler: (message: Message, args: { count: number }) => {
    changelog.embeds.slice(changelog.embeds.length - args.count).forEach(e => message.author.send(new MessageEmbed(e as any)));
  }
};

export default command;
