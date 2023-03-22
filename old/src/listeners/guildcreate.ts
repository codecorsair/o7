import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';
import { reset } from '../lib/settings';

export default class ReadyListener extends Listener {
  constructor() {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate'
    });
  }

  async exec(guild: Guild) {
    await reset(guild.id);
  }
}
