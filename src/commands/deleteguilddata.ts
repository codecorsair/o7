import { Message, CommandDef, DiscordPermissions } from '../lib/types';
import * as mongo from '../lib/db';
import { localize } from '../lib/localize';

const command: CommandDef = {
  name: 'command_deleteguilddata_name',
  alias: ['deleteguilddata'],
  userPermissions: [DiscordPermissions.ADMINISTRATOR],
  channel: 'guild',
  args: [{
    key: 'confirmation',
    name: 'command_deleteguilddata_arg_confirmation_name',
    prompt: {
      start: 'command_deleteguilddata_arg_confirmation_prompt',
      reactions: [{
        emoji: '✅',
        value: true,
      }]
    },
  }],
  handler: async (message: Message, args: { confirmation: boolean; }) => {
    if (!message.guild) return;
    if (!args.confirmation) {
      return message.channel.send(localize('command_deleteguilddata_delete_aborted', message.prefix, message.lang));
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
