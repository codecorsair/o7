import { Client, CacheClient } from 'discord-cross-hosting';
import { ClusterManager } from 'discord-hybrid-sharding';
import { createLogger } from '@/shared/utils/logger';
import { hostname } from 'os';
import Config from "./Config";

const ONE_MINUTE = 60 * 1000;

const logger = createLogger();

const client = new Client({
  agent: `Discord-Cluster/${Config.agent} (${hostname()})`, // User-Agent
  host: Config.host, // Domain without https
  port: Config.port, // Proxy Connection (Replit) needs Port 443
  handshake: Config.handshake,
  authToken: Config.authToken,
  rollingRestarts: Config.rollingRestarts // Enable, when bot should respawn when cluster list changes.
});
const storage = new CacheClient(client, {
  path: [
      {
          path: 'guilds',
          maxSize: 100,
      },
      {
          path: 'channels',
          maxSize: 100,
      },
  ],
});
client.on('debug', (message) => logger.debug(`[DEBUG] ${message}`));
client.on('ready', () => {
  logger.info('Connected to Discord Cross Hosting')

  const clusterManager = new ClusterManager(`${__dirname}/../bot/index.js`, {
    totalShards: 1,
    totalClusters: 'auto'
  }); // Some dummy Data
  clusterManager.on('clusterCreate', (cluster) => logger.info(`Cluster ${cluster.id} created`));
  clusterManager.on('debug', (message) => logger.debug(message));
  client.listen(clusterManager);

  client
    .requestShardData()
    .then((e: any) => {
      if (!e) return;
      if (!e.shardList) return;
      clusterManager.totalShards = e.totalShards;
      clusterManager.totalClusters = e.shardList.length;
      clusterManager.shardList = e.shardList;
      clusterManager.clusterList = e.clusterList;
      clusterManager.spawn({ timeout: ONE_MINUTE });
    })
    .catch((err: any) => {
      logger.error(`Error while fetching shard data: ${err}`);
    });
});

client.connect();
