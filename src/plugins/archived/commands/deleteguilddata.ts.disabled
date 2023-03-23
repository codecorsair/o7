import { Message, CommandDef, DiscordPermissions } from '../lib/types';
import * as mongo from '../lib/db';

const command: CommandDef = {
  name: 'deleteguilddata',
  alias: ['deleteguilddata'],
  userPermissions: [DiscordPermissions.ADMINISTRATOR],
  channel: 'guild',
  args: [{
    name: 'confirmation',
    prompt: {
      start: `**Warning!** this will delete all saved data for this server (guild).\nThere is no undo.\n\nTo confirm click ✅`,
      reactions: [{
        emoji: '✅',
        value: true,
      }]
    },
  }],
  handler: async (message: Message, args: { confirmation: boolean; }) => {
    if (!message.guild) return;
    if (!args.confirmation) {
      return message.channel.send(`Phew! That was a close one.... delete aborted.`);
    }
    message.channel.send(`Attempting to delete all data for this guild, please wait...`);
    const guildId = message.guild.id;
    const client = mongo.getClient();
    try {
      await client.connect();
      let result = await client.getDb().collection(mongo.collections.settings).deleteOne({ guildId });
      if (result.result.ok) {
        message.channel.send('...settings deleted...');
      };

      result = await client.getDb().collection(mongo.collections.appconfig).deleteOne({ id: guildId });
      if (result.result.ok) {
        message.channel.send('...application config deleted...');
      };

      return message.channel.send('All data for this guild has been deleted!');
    } catch (err) {
      console.error(`Failed to reset guild data. ${err}`);
    }

    return message.channel.send('Oh no! something went wrong, please inform a developer!');
  }
};

export default command;
