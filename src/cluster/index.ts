import { Client } from 'discord-cross-hosting';
import { ClusterManager } from 'discord-hybrid-sharding';

const client = new Client({
    agent: 'bot',
    host: 'localhost', // Domain without https
    port: 4444, // Proxy Connection (Replit) needs Port 443
    // handshake: true, When Replit or any other Proxy is used
    authToken: 'theauthtoken',
    rollingRestarts: false, // Enable, when bot should respawn when cluster list changes.
});
client.on('debug', console.log);
client.connect();

const clusterManager = new ClusterManager(`${__dirname}/bot/index.js`, { totalShards: 1, totalClusters: 'auto' }); // Some dummy Data
clusterManager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
clusterManager.on('debug', console.log);

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
    .catch(e => console.log(e));