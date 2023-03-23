import { Client } from 'discord-cross-hosting';
import { ClusterManager } from 'discord-hybrid-sharding';
import { createLogger } from '@/shared/utils/logger';
import Config from "./Config";

const logger = createLogger();

const client = new Client({
  agent: Config.agent,
  host: Config.host, // Domain without https
  port: Config.port, // Proxy Connection (Replit) needs Port 443
  handshake: Config.handshake,
  authToken: Config.authToken,
  rollingRestarts: Config.rollingRestarts // Enable, when bot should respawn when cluster list changes.
});
client.on('debug', (message) => logger.debug(`[DEBUG] ${message}`));
client.connect();

const clusterManager = new ClusterManager(`${__dirname}/../bot/index.js`, {
  totalShards: 1,
  totalClusters: 'auto'
  mode: 'process'
}); // Some dummy Data
clusterManager.on('clusterCreate', (cluster) =>
  logger.info(`Cluster ${cluster.id} created`)
);
clusterManager.on('debug', (message) => logger.debug(message));

client.listen(clusterManager);
client
  .requestShardData()
  .then((e) => {
    if (!e) return;
    if (!e.shardList) return;
    clusterManager.totalShards = e.totalShards;
    clusterManager.totalClusters = e.shardList.length;
    // clusterManager.shardList = e.shardList;
    clusterManager.clusterList = e.clusterList;
    clusterManager.spawn({ timeout: -1 });
  })
  .catch((err: any) => logger.error(`Error while fetching shard data: ${err}`));
