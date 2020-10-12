import { VoiceChannel } from 'discord.js';
import { Message, CommandDef } from '../../../lib/types';
import * as db from '../lib/db';

const command: CommandDef = {
  name: 'voice rename',
  alias: ['rename'],
  channel: 'guild',
  help: {
    description: 'Rename a temporary channel you are in.',
  },
  args: [{
    name: 'name',
    type: 'content',
  }],
  handler: async (message: Message, args: { name: string; }) => {
    if (!message.guild || !args || !args.name.trim()) return;
    const voiceChannelId = message.member?.voice.channel?.id;
    if (!voiceChannelId) return;
    if (!db.getCreatedChannel(voiceChannelId)) return;
    const vc = message.client.channels.cache.get(voiceChannelId) as VoiceChannel;
    if (!vc) return;
    await vc.setName(args.name.trim());
  }
};

export default command;
