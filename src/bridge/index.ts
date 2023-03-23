import { Bridge } from 'discord-cross-hosting';
import { RatelimitManager } from 'discord-cross-ratelimit';
import { createLogger } from '@/shared/utils/logger';
import Config from './Config';

const logger = createLogger();

const server = new Bridge({
  port: Config.port, // The Port of the Server | Proxy Connection (Replit) needs Port 443
  authToken: Config.authToken,
  totalShards: Config.totalShards, // The Total Shards of the Bot or 'auto'
  totalMachines: Config.totalMachines, // The Total Machines, where the Clusters will run
  shardsPerCluster: Config.shardsPerCluster, // The amount of Internal Shards, which are in one Cluster
  token: Config.token
});
new RatelimitManager(server);
server.on('debug', (message) => logger.debug(`[DEBUG] ${message}`));
server.start();
server.on('ready', (url) => {
  logger.info(`Bridge is ready at ${url}`);
  setInterval(() => {
    server
      .broadcastEval('this.guilds.cache.size')
      .then((results: any) => logger.info(`Guilds: ${results.reduce((prev, val) => prev + val, 0)}`))
      .catch((err: any) => logger.error(`Error while fetching guild count: ${err}`));
  }, 10000);
});
