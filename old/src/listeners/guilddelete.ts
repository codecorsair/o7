import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';
import { deleteGuild } from '../lib/settings';

export default class GuildDeleteListener extends Listener {
  constructor() {
    super('guildDelete', {
      emitter: 'client',
      event: 'guildDelete'
    });
  }

  async exec(guild: Guild) {
    await deleteGuild(guild.id);
  }
}
