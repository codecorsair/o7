import { getClient, collections } from './db';
import config from '../config';

interface Settings {
  guildId: string;
  prefix: string;
  disabledCommands: string[];
}

const cache: { [id: string]: Settings; } = {};

export function defaultSettings(guildId: string): Settings {
  return {
    guildId,
    prefix: config.prefix,
    disabledCommands: []
  }
}

export async function initSettings() {
  const client = getClient();
  try {
    await client.connect();
    await client.getDb()
      .collection(collections.settings)
      .createIndex({ guildId: 1 });
    const cursor = await client.getDb()
      .collection(collections.settings)
      .find<Settings>({}, {});
    if (await cursor.count() === 0) {
      console.error('No guild settings documents were found!');
    }
    await cursor.forEach(settings => {
      cache[settings.guildId] = settings;
    });
  } catch (err) {
    console.error(`Failed to find any guild settings. ${err}`);
  }
}
initSettings();

export async function setPrefix(guildId: string, prefix: string) {
  const client = getClient();
  try {
    await client.connect();
    const db = client.getDb();
    await db.collection(collections.settings)
      .updateOne({ guildId }, { $set: { prefix }});
    cache[guildId].prefix = prefix;
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export async function reset(guildId: string) {
  const client = getClient();
  try {
    await client.connect();
    const db = client.getDb();
    await db.collection(collections.settings)
      .updateOne({ guildId: guildId }, { $set: defaultSettings(guildId) }, { upsert: true });
    cache[guildId] = defaultSettings(guildId);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export async function deleteGuild(guildId: string) {
  const client = getClient();
  try {
    await client.connect();
    const db = client.getDb();
    await db.collection(collections.settings)
      .deleteOne({ guildId });
    delete cache[guildId];
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export function getSettings(guildId: string) {
  if (cache[guildId]) return cache[guildId];
  cache[guildId] = defaultSettings(guildId);
  return cache[guildId];
}
