import { DiscordPermissions } from '../../../lib/types';
import { User, VoiceChannel } from 'discord.js';


export async function setBotPermissionsOnChannel(user: User, channel: VoiceChannel) {
  await channel.updateOverwrite(user,
    {
      [DiscordPermissions.VIEW_CHANNEL]: true,
      [DiscordPermissions.MOVE_MEMBERS]: true,
      [DiscordPermissions.MANAGE_CHANNELS]: true,
    });
}