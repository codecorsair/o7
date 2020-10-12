import { Client, VoiceChannel } from 'discord.js';
import * as mongo from '../../../lib/db';
import { GuildVoiceConfig, ChannelConfig, CreatedChannel } from './types';

const configCache: {[id: string]: GuildVoiceConfig} = {};
const autoChannelsCache: {[id: string]: ChannelConfig} = {};
const createdChannelsCache: {[id: string]: CreatedChannel} = {};

export async function getGuildVoiceConfig(guildId: string, nocache?: boolean) {
  if (!nocache && configCache[guildId]) return configCache[guildId];
  const client = mongo.getClient();
  try {
    await client.connect();
    const config = (await client.getDb()
      .collection(mongo.collections.autovoiceconfig)
      .findOne<GuildVoiceConfig>({ id: guildId })) as GuildVoiceConfig;
    if (config) {
      configCache[guildId] = config;
    }
    return config;
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export async function saveGuildVoiceConfig(config: GuildVoiceConfig) {
  const client = mongo.getClient();
  try {
    await client.connect();
    const res = await client.getDb()
      .collection(mongo.collections.autovoiceconfig)
      .updateOne({ id: config.id },
                  { $set: config },
                  { upsert: true });
    if (res.modifiedCount === 1 || res.upsertedCount === 1) {
      configCache[config.id] = config;
      Object.values(config.channels).forEach(channel => autoChannelsCache[channel.id] = channel);
      return true;
    }
  } catch (err) {
    console.error(`saveGuildVoiceConfig: ${err}`)
  } finally {
    await client.close();
  }
  return false;
}

export async function saveAutoChannel(guildId: string, config: ChannelConfig) {
  const client = mongo.getClient();
  try {
    await client.connect();
    const res = await client.getDb()
      .collection(mongo.collections.autovoiceconfig)
      .updateOne({ id: guildId },
                  { $set: {
                    id: guildId,
                    [`channels.${config.id}`]: config,
                  }},
                  { upsert: true });
    if (res.modifiedCount === 1 || res.upsertedCount === 1) {
      const guildcache = configCache[guildId];
      if (guildcache) {
        guildcache.channels[config.id] = config;
      } else {
        configCache[guildId] = {
          id: guildId,
          channels: {
            [config.id]: config,
          }
        };
      }
      autoChannelsCache[config.id] = config;
      return true;
    }
  } catch (err) {
    console.error(`saveAutoChannel: ${err}`)
  } finally {
    await client.close();
  }
  return false;
}

export async function initCaches() {
  const client = mongo.getClient();
  try {
    await client.connect();
    {
      const cursor = client.getDb()
        .collection(mongo.collections.autovoiceconfig)
        .find<GuildVoiceConfig>({});

      if ((await cursor.count()) === 0) {
        console.warn('initCaches: No auto voice channel configs were found.');
        return false;
      }

      await cursor.forEach(config => {
        configCache[config.id] = config;
        Object.values(config.channels).forEach(channel => autoChannelsCache[channel.id] = channel);
      });
    }

    {
      const cursor = client.getDb()
        .collection(mongo.collections.autovoicecreatedchannels)
        .find<CreatedChannel>({});

      if ((await cursor.count()) === 0) {
        return false;
      }

      await cursor.forEach(cc => {
        createdChannelsCache[cc.id] = cc;
      });
    }

    return true;
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
  return false;
}

export async function saveCreatedChannel(created: CreatedChannel) {
  const client = mongo.getClient();
  try {
    await client.connect();
    const res = await client.getDb()
      .collection(mongo.collections.autovoicecreatedchannels)
      .updateOne({ id: created.id },
                  { $set: created },
                  { upsert: true });
    if (res.modifiedCount === 1 || res.upsertedCount === 1) {
      createdChannelsCache[created.id] = created;
      return true;
    }
  } catch (err) {
    console.error(`saveCreatedChannel: ${err}`)
  } finally {
    await client.close();
  }
  return false;
}

export async function deleteCreatedChannel(id: string) {
  const client = mongo.getClient();
  try {
    await client.connect();
    const res = await client.getDb()
      .collection(mongo.collections.autovoicecreatedchannels)
      .deleteOne({ id: id });
    if (res.deletedCount === 1) {
      delete createdChannelsCache[id];
      return true;
    }
  } catch (err) {
    console.error(`deleteCreatedChannel: ${err}`)
  } finally {
    await client.close();
  }
  return false;
}

export function getAutoChannelConfig(channelId: string) {
  return autoChannelsCache[channelId];
}

export function getCreatedChannel(channelId: string) {
  return createdChannelsCache[channelId];
}

export async function cleanupEmptyChannels(client: Client) {
  for (const id in createdChannelsCache) {
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
