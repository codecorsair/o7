import { Client } from 'discord-cross-hosting';
import { ClusterManager } from 'discord-hybrid-sharding';
import { createLogger } from '@/shared/utils/logger';
import Config from "./Config";

const ONE_MINUTE = 60 * 1000;

const logger = createLogger();

const GUID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const client = new Client({
  agent: `Discord-Hybrid-Sharding/${Config.agent} ${GUID}`, // User-Agent
  host: Config.host, // Domain without https
  port: Config.port, // Proxy Connection (Replit) needs Port 443
  handshake: Config.handshake,
  authToken: Config.authToken,
  rollingRestarts: Config.rollingRestarts // Enable, when bot should respawn when cluster list changes.
});
client.on('debug', (message) => logger.debug(`[DEBUG] ${message}`));

const clusterManager = new ClusterManager(`${__dirname}/../bot/index.js`, {
  totalShards: 1,
  totalClusters: 'auto',
  mode: 'worker'
}); // Some dummy Data
clusterManager.on('clusterCreate', (cluster) =>
  logger.info(`Cluster ${cluster.id} created`)
);
clusterManager.on('debug', (message) => logger.debug(message));
client.on('ready', () => {
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
    process.exit(1);
  });
});

client.listen(clusterManager);
client.connect();