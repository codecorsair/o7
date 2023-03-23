import { Bridge } from 'discord-cross-hosting';

const server = new Bridge({
    port: 4444, // The Port of the Server | Proxy Connection (Replit) needs Port 443
    authToken: 'Your_auth_token_same_in_cluster.js',
    totalShards: 40, // The Total Shards of the Bot or 'auto'
    totalMachines: 2, // The Total Machines, where the Clusters will run
    shardsPerCluster: 10, // The amount of Internal Shards, which are in one Cluster
    token: 'Your_Bot_Token',
});

server.on('debug', console.log);
server.start();
server.on('ready', url => {
    console.log('Server is ready' + url);
    setInterval(() => {
        server.broadcastEval('this.guilds.cache.size').then(console.log).catch(console.log);
    }, 10000);
});