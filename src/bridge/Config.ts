import { GenericConfig } from '@/shared/GenericConfig';
import { assert } from '@/shared/utils/assert';

const {
  BRIDGE_PORT,
  BRIDGE_AUTH_TOKEN,
  BRIDGE_TOTAL_SHARDS,
  BRIDGE_TOTAL_MACHINES,
  BRIDGE_SHARDS_PER_CLUSTER,
  BRIDGE_TOKEN,
} = process.env;

export interface IConfig {
  port: number;
  authToken: string;
  totalShards: number | 'auto';
  totalMachines: number;
  shardsPerCluster: number;
  token: string;
}

const Config = new GenericConfig<IConfig>('bridge.json');

export default {
  port: assert<number>(
    'Port is not defined',
    BRIDGE_PORT && parseInt(BRIDGE_PORT as string),
    Config.get('port'),
    4444
  ),
  authToken: assert<string>(
    `Configure bridge auth token using the "authToken" key in the config file or the "BRIDGE_AUTH_TOKEN" environment variable.`,
    BRIDGE_AUTH_TOKEN,
    Config.get('authToken')
  ),
  totalShards: assert<number | 'auto'>(
    `Configure bridge total shards using the "totalShards" key in the config file or the "BRIDGE_TOTAL_SHARDS" environment variable.`,
    BRIDGE_TOTAL_SHARDS && BRIDGE_TOTAL_SHARDS === 'auto' ? 'auto' : parseInt(BRIDGE_TOTAL_SHARDS as string),
    Config.get('totalShards')
  ),
  totalMachines: assert<number>(
    `Configure bridge total machines using the "totalMachines" key in the config file or the "BRIDGE_TOTAL_MACHINES" environment variable.`,
    BRIDGE_TOTAL_MACHINES && parseInt(BRIDGE_TOTAL_MACHINES as string),
    Config.get('totalMachines')
  ),
  shardsPerCluster: assert<number>(
    `Configure bridge shards per cluster using the "shardsPerCluster" key in the config file or the "BRIDGE_SHARDS_PER_CLUSTER" environment variable.`,
    BRIDGE_SHARDS_PER_CLUSTER && parseInt(BRIDGE_SHARDS_PER_CLUSTER as string),
    Config.get('shardsPerCluster')
  ),
  token: assert<string>(
    `Configure bridge token using the "token" key in the config file.`,
    BRIDGE_TOKEN,
    Config.get('token')
  ),
} as IConfig;
