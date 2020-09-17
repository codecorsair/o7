import { db } from '../db';

interface Settings {
  guildId: string;
  prefix: string;
  disabledCommands: string[];
}

export const GUILD_SETTINGS_COLLECTION = 'guildsettings';
const cache: {[id: string]: Settings} = {};

function defaultSettings(guildId: string): Settings {
  return {
    guildId,
    prefix: '!',
    disabledCommands: []
  }
}

export async function initSettings() {
  try {
    await db.collection(GUILD_SETTINGS_COLLECTION).find<Settings>({}, async cursor => {
      if (await cursor.count() === 0) {
        console.error('No guild settings documents were found!');
      }
      await cursor.forEach(it => {
        cache[it.guildId] = it;
      });
    });
  } catch (err) {
    console.error(`Failed to find any guild settings. ${err}`);
  }
}

export async function updateSettings(settings: Settings) {
  await db.collection(GUILD_SETTINGS_COLLECTION)
    .upsert({ guildId: settings.guildId }, { $set: { ...settings } });
  cache[settings.guildId] = settings;
}

export function getSettings(guildId: string) {
  if (cache[guildId]) return cache[guildId];
  return defaultSettings(guildId);
}
