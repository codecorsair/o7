import { NewsChannel } from 'discord.js';
import { TextChannel } from 'discord.js';
import { Message, CommandDef, DiscordPermissions } from '../../../lib/types';
import { askQuestionWithMessageResponse } from '../../../lib/utils/args';
import * as db from '../lib/db';
import config from '../../../config.json';

export interface AppConfig {
  id: string,
  appChannel: string,
  questions: string[],
}

const MAX_CHANNELS_PER_GUILD = 5;

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
    examples: [{
      args: '',
      description: 'Create a standard auto voice channel which makes channels named after the user who creates it.',
    },{
      args: 'sequential',
      description: 'Creates a channel with a custom name and will sequentially number them as they are made.',
    }]
  },
  handler: async (message: Message, args: { type?: string; }) => {
    if (!message.guild) return;
    const client = message.client;
    const guildConfig = await db.getGuildVoiceConfig(message.guild.id, true);
    if (guildConfig) {
      for (const ch of Object.values(guildConfig.channels)) {
        if (!client.channels.cache.get(ch.id)) {
          delete guildConfig.channels[ch.id];
        }
      }
      await db.saveGuildVoiceConfig(guildConfig);
      if (Object.values(guildConfig.channels).length >= MAX_CHANNELS_PER_GUILD && !config.owners.find(o => o === message.author.id)) {
        return message.channel.send(`The limit of auto voice channels has already been reached, please delete one before attempting to create another.`);
      }
    }

    const channelConfig: any = {}
    const type = args && args.type ? args.type as any : 'standard';
    switch(type) {
      case 'standard':
        channelConfig.type = 'standard';
        break;
      case 'sequential':
        channelConfig.type = 'sequential';
        const name = await askQuestionWithMessageResponse('What would you like to name the created channels?', message.channel, { name: 'content', type: 'content', prompt: { start: '' }})
        channelConfig.name = name;
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
              id: client.user?.id || '',
              allow: [DiscordPermissions.VIEW_CHANNEL, DiscordPermissions.MANAGE_CHANNELS, DiscordPermissions.MOVE_MEMBERS]
            }
          ]
      });
      channelConfig.id = created.id;
    } catch (err) {
      message.channel.send('I was unable to create a channel, please check that I have the appropriate permissions in this server/category.');
    }
    if (channelConfig.id) {
      await db.saveAutoChannel(message.guild.id, channelConfig);
      message.channel.send('Done, a new auto voice channel has been created.');
    }
  }
};

export default command;
