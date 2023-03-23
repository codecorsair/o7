import { Client } from 'discord-cross-hosting';
import { ClusterManager } from 'discord-hybrid-sharding';
import { createLogger } from '@/src/shared/utils/logger';

const logger = createLogger();

const client = new Client({
    agent: 'bot',
    host: 'localhost', // Domain without https
    port: 4444, // Proxy Connection (Replit) needs Port 443
    // handshake: true, When Replit or any other Proxy is used
    authToken: 'theauthtoken',
    rollingRestarts: false, // Enable, when bot should respawn when cluster list changes.
});
client.on('debug', logger.debug);
client.connect();

const clusterManager = new ClusterManager(`${__dirname}/bot/index.js`, { totalShards: 1, totalClusters: 'auto' }); // Some dummy Data
clusterManager.on('clusterCreate', cluster => logger.info(`Cluster ${cluster.id} created`));
clusterManager.on('debug', logger.debug);

client.listen(clusterManager);
client
    .requestShardData()
    .then(e => {
        if (!e) return;
        if (!e.shardList) return;
        clusterManager.totalShards = e.totalShards;
        clusterManager.totalClusters = e.shardList.length;
        // clusterManager.shardList = e.shardList;
        clusterManager.clusterList = e.clusterList;
        clusterManager.spawn({ timeout: -1 });
    })
    .catch(logger.error);