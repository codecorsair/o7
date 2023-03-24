import { Client } from './Client';
import Config from './Config';
import { getInfo } from 'discord-hybrid-sharding';

const client = new Client({
  intents: Config.intents as any,
  shards: getInfo().SHARD_LIST,
  shardCount: getInfo().TOTAL_SHARDS
});

client.login(Config.token);
