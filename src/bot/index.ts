import { Client } from './Client';
import Config from './Config';

const client = new Client({
  intents: ['Guilds'], // Your Intents
  shards: getInfo().SHARD_LIST, // An Array of Shard list, which will get spawned
  shardCount: getInfo().TOTAL_SHARDS // The Number of Total Shards
});

client
  .login(Config.token)
  .catch((e) => console.error(`Error while logging in: ${e}`))
  .then(() => {
    console.log('Logged in');
  });
