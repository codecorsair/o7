import { MessageEmbed } from 'discord.js';
import { Message, CommandDef } from '../lib/types';
import changelog from '../data/changelog.json';

const command: CommandDef = {
  name: 'command_changelog_name',
  alias: ['changelog'],
  args: [{
    key: 'count',
    name: 'command_changelog_arg_count',
    type: 'number',
  }],
  handler: (message: Message, args: { count: number }) => {
    changelog.embeds.slice(changelog.embeds.length - args.count).forEach(e => message.author.send(new MessageEmbed(e as any)));
  }
};

export default command;
