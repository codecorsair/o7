import { GenericConfig } from '@/shared/GenericConfig';
import { assert } from '@/shared/utils/assert';

const {
  BRIDGE_PORT,
  BRIDGE_AUTH_TOKEN,
  BRIDGE_TOTAL_SHARDS,
  BRIDGE_TOTAL_MACHINES,
  BRIDGE_SHARDS_PER_CLUSTER,
  BRIDGE_TOKEN
} = process.env;

export interface IConfig {
  port: number;
  authToken: string;
  totalShards: number;
  totalMachines: number;
  shardsPerCluster: number;
  token: string;
}

const Config = new GenericConfig<IConfig>('bridge.json');

export default {
  port: assert<number>('Port is not defined', BRIDGE_PORT, Config.get('port'), 4444),
  authToken: assert<string>(
    'Auth token is not defined',
    BRIDGE_AUTH_TOKEN,
    Config.get('authToken')
  ),
  totalShards: assert<number>(
    'Total shards is not defined',
    BRIDGE_TOTAL_SHARDS,
    Config.get('totalShards')
  ),
  totalMachines: assert<number>(
    'Total machines is not defined',
    BRIDGE_TOTAL_MACHINES,
    Config.get('totalMachines')
  ),
  shardsPerCluster: assert<number>(
    'Shards per cluster is not defined',
    BRIDGE_SHARDS_PER_CLUSTER,
    Config.get('shardsPerCluster')
  ),
  token: assert<string>(
    'Token is not defined',
    BRIDGE_TOKEN,
    Config.get('token')
  )
} as IConfig;
