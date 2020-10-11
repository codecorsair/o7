import * as db from './db';
import { Client } from '../../../lib/types';
import { VoiceChannel } from 'discord.js';

export async function cleanupEmptyChannels(client: Client) {
  for (const id in db.createdChannelsCache) {
    const channel = client.channels.cache.get(id);
    if (!channel) continue;
    const vc = channel as VoiceChannel;
    if (vc.members.size === 0) {
      try {
        vc.delete();
      } catch(err) {
        console.error(`Failed to delete voice channel ${id}`);
      }
    }
  }
}
