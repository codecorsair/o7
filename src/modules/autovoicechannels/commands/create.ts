import { NewsChannel } from 'discord.js';
import { TextChannel } from 'discord.js';
import { Message, CommandDef, DiscordPermissions } from '../../../lib/types';
import { askQuestionWithMessageResponse } from '../../../lib/utils/args';
import { saveAutoChannel } from '../lib/db';

export interface AppConfig {
  id: string,
  appChannel: string,
  questions: string[],
}

const command: CommandDef = {
  name: 'create',
  alias: ['create'],
  channel: 'guild',
  userPermissions: [DiscordPermissions.MANAGE_CHANNELS],
  args: [{
    name: 'type',
    optional: true,
  }],
  help: {
    description: 'This command creates a new auto voice channel.',
  },
  handler: async (message: Message, args: { type?: string; }) => {
    if (!message.guild) return;
    const config: any = {}
    const type = args && args.type ? args.type as any : 'standard';
    switch(type) {
      case 'standard':
        config.type = 'standard';
        break;
      case 'sequential':
        config.type = 'sequential';
        const name = await askQuestionWithMessageResponse('What would you like to name the created channels?', message.channel, { name: 'content', type: 'content', prompt: { start: '' }})
        config.name = name;
        break;
    }
    const messageChannel = message.channel as TextChannel | NewsChannel;
    try {
      const created = await message.guild.channels.create('Join To Create', 
        {
          type: 'voice',
          parent: messageChannel.parent || undefined,
          permissionOverwrites: [
            ...messageChannel.permissionOverwrites.map(po => po),
            {
              id: message.client.user?.id || '',
              allow: [DiscordPermissions.VIEW_CHANNEL, DiscordPermissions.MANAGE_CHANNELS, DiscordPermissions.MOVE_MEMBERS]
            }
          ]
      });
      config.id = created.id;
    } catch (err) {
      message.channel.send('I was unable to create a channel, please check that I have the appropriate permissions in this server/category.');
    }
    if (config.id) {
      await saveAutoChannel(message.guild.id, config);
      message.channel.send('Done, a new auto voice channel has been created.');
    }
  }
};

export default command;
