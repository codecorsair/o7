import { Message, Command, DiscordPermissions } from '../lib/types';
import * as settings from '../lib/settings';

const command: Command = {
  name: 'prefix',
  alias: ['prefix'],
  channel: 'guild',
  userPermissions: [DiscordPermissions.ADMINISTRATOR],
  args: [{
    name: 'prefix',
  }],
  help: {
    description: 'This command will change the prefix this bot will respond to on this Discord server.',
  },
  handler: async (message: Message, args: { prefix: string; }) => {
    if (!message.guild) return;
    try {
      await settings.setPrefix(message.guild.id, args.prefix);
      return message.reply(`Prefix changed to ${args.prefix}`);
    } catch (err) {
      return message.reply(`Oh no! There was an error talking with our database. Prefix has not been changed.`);
    }
  }
};

export default command;
