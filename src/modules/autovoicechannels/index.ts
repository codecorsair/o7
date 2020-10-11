import { MessageEmbed } from 'discord.js';
import { VoiceState } from 'discord.js';
import { Client, ModuleDef, Message, DiscordPermissions } from '../../lib/types';
import * as db from './lib/db';

const moduleDef: ModuleDef = {
  name: 'auto voice channels',
  commandGroup: ['voice', 'v'],
  initialize,
  getHelp,
  deleteGuildData,
  deleteUserData,
}
export default moduleDef;

async function initialize(client: Client) {
  client.on('voiceStateUpdate', onVoiceStateUpdate);
  await db.initCaches();
  await db.cleanupEmptyChannels(client);
}

function getHelp(message: Message) {
  return [new MessageEmbed()
    .setTitle('Auto Voice Channels')
    .setDescription(`${message.prefix}voice`)];
}

async function deleteGuildData() {
  return await true;
}

async function deleteUserData() {
  return await true;
}

async function onVoiceStateUpdate(oldMember: VoiceState, newMember: VoiceState) {
  const leftCreatedChannel = db.getCreatedChannel(oldMember.channel?.id || '');
  if (leftCreatedChannel && oldMember.channel) {
    // user left an auto channel, check if channel is empty and delete
    if (oldMember.channel.members.size === 0) {
      const id = oldMember.channel.id;
      try {
        await oldMember.channel.delete();
        await db.deleteCreatedChannel(id);
      } catch (err) {
        console.error(`onVoiceStateUpdate: Failed to delete channel ${id}.`)
      }
    }
  }

  if (!newMember.channel) return;

  const newChannelConfig = db.getAutoChannelConfig(newMember.channel.id);
  if (newChannelConfig) {
    // user joined an auto channel - make a new channel
    switch(newChannelConfig.type) {
      case 'standard': {
        const ch = await newMember.guild.channels.create(`${newMember.member?.displayName}'s Room`, 
          {
            type: 'voice',
            parent: newMember.channel?.parent || undefined,
            permissionOverwrites: [
              ...newMember.channel.permissionOverwrites.map(po => po),
              {
                id: newMember.client.user?.id || '',
                allow: [DiscordPermissions.VIEW_CHANNEL, DiscordPermissions.MANAGE_CHANNELS, DiscordPermissions.MOVE_MEMBERS]
              }
            ]
        });
        newMember.member?.voice.setChannel(ch);
        db.saveCreatedChannel({ id: ch.id, from: newChannelConfig.id });
        break;
      }
      case 'sequential':
        const num = (newMember.channel?.parent?.children.filter(c => !!c.name.match(`${newChannelConfig.name} #[0-9]+`)).size || 0) + 1;
        const ch = await newMember.guild.channels.create(`${newChannelConfig.name} #${num}`, 
          {
            type: 'voice',
            parent: newMember.channel?.parent || undefined,
            permissionOverwrites: [
              ...newMember.channel.permissionOverwrites.map(po => po),
              {
                id: newMember.client.user?.id || '',
                allow: [DiscordPermissions.VIEW_CHANNEL, DiscordPermissions.MANAGE_CHANNELS, DiscordPermissions.MOVE_MEMBERS]
              }
            ]
        });
        newMember.member?.voice.setChannel(ch);
        db.saveCreatedChannel({ id: ch.id, from: newChannelConfig.id });
        break;
    }
  }
}