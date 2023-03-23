import { Bridge } from 'discord-cross-hosting';
import { RatelimitManager } from "discord-cross-ratelimit";
import { createLogger } from '@/src/shared/utils/logger';

const logger = createLogger();

const server = new Bridge({
    port: 4444, // The Port of the Server | Proxy Connection (Replit) needs Port 443
    authToken: 'Your_auth_token_same_in_cluster.js',
    totalShards: 40, // The Total Shards of the Bot or 'auto'
    totalMachines: 2, // The Total Machines, where the Clusters will run
    shardsPerCluster: 10, // The amount of Internal Shards, which are in one Cluster
    token: 'Your_Bot_Token',
});
new RatelimitManager(server);
server.on('debug', logger.debug);
server.start();
server.on('ready', url => {
    logger.info(`Bridge is ready at ${url}`);
    setInterval(() => {
        server.broadcastEval('this.guilds.cache.size').then(logger.info).catch(logger.error);
    }, 10000);
});