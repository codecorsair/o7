import { Client } from 'discord-cross-hosting';
import { ClusterManager } from 'discord-hybrid-sharding';
import { createLogger } from '@/shared/utils/logger';
import { hostname } from 'os';
import Config from './Config';

const ONE_MINUTE = 60 * 1000;

const logger = createLogger("cluster");

const client = new Client({
  agent: `Discord-Cluster/${Config.agent} (${hostname()})`, // User-Agent
  host: Config.host, // Domain without https
  port: Config.port, // Proxy Connection (Replit) needs Port 443
  handshake: Config.handshake,
  authToken: Config.authToken,
  rollingRestarts: Config.rollingRestarts // Enable, when bot should respawn when cluster list changes.
});
const clusterManager = new ClusterManager(`${__dirname}/../bot/index.js`, {
  totalShards: 1
});
client.on('debug', (message) => logger.debug(message));
const fetchShardData = async () => {
  try {
    const shardData = (await client.requestShardData()) as any;

    if (!shardData || !shardData.shardList) {
      return;
    }
    clusterManager.totalShards = shardData.totalShards;
    clusterManager.totalClusters = shardData.shardList.length;
    clusterManager.shardList = shardData.shardList;
    clusterManager.clusterList = shardData.clusterList;
    clusterManager.spawn({ timeout: ONE_MINUTE });
  } catch (err: any) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

clusterManager.on('clusterCreate', (cluster) =>
  logger.info(`Cluster ${cluster.id} created`)
);
clusterManager.on('debug', (message) => logger.debug(message);
client.on('ready', async () => {
  await fetchShardData();

  client.listen(clusterManager);
});

client.connect();
