import { GenericConfig } from '@/shared/GenericConfig';
import { assert } from '@/shared/utils/assert';

const {
  BRIDGE_PORT,
  BRIDGE_AUTH_TOKEN,
  BRIDGE_TOTAL_SHARDS,
  BRIDGE_TOTAL_MACHINES,
  BRIDGE_SHARDS_PER_CLUSTER,
} = process.env;

export interface IConfig {
  port: number;
  authToken: string;
  totalShards: number;
  totalMachines: number;
  shardsPerCluster: number;
}

const Config = new GenericConfig<IConfig>('bridge.json');

export default {
  port: assert<number>(
    'Port is not defined',
    Number(BRIDGE_PORT),
    Config.get('port'),
    4444
  ),
  authToken: assert<string>(
    `Configure bridge auth token using the "authToken" key in the config file or the "BRIDGE_AUTH_TOKEN" environment variable.`,
    String(BRIDGE_AUTH_TOKEN),
    Config.get('authToken')
  ),
  totalShards: assert<number>(
    `Configure bridge total shards using the "totalShards" key in the config file or the "BRIDGE_TOTAL_SHARDS" environment variable.`,
    Number(BRIDGE_TOTAL_SHARDS),
    Config.get('totalShards')
  ),
  totalMachines: assert<number>(
    `Configure bridge total machines using the "totalMachines" key in the config file or the "BRIDGE_TOTAL_MACHINES" environment variable.`,
    Number(BRIDGE_TOTAL_MACHINES),
    Config.get('totalMachines')
  ),
  shardsPerCluster: assert<number>(
    `Configure bridge shards per cluster using the "shardsPerCluster" key in the config file or the "BRIDGE_SHARDS_PER_CLUSTER" environment variable.`,
    Number(BRIDGE_SHARDS_PER_CLUSTER),
    Config.get('shardsPerCluster')
  )
} as IConfig;
