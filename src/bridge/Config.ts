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
  port: assert<number>('Port is not defined', Config.get('port'), BRIDGE_PORT),
  authToken: assert<string>(
    'Auth token is not defined',
    Config.get('authToken'),
    BRIDGE_AUTH_TOKEN
  ),
  totalShards: assert<number>(
    'Total shards is not defined',
    Config.get('totalShards'),
    BRIDGE_TOTAL_SHARDS
  ),
  totalMachines: assert<number>(
    'Total machines is not defined',
    Config.get('totalMachines'),
    BRIDGE_TOTAL_MACHINES
  ),
  shardsPerCluster: assert<number>(
    'Shards per cluster is not defined',
    Config.get('shardsPerCluster'),
    BRIDGE_SHARDS_PER_CLUSTER
  ),
  token: assert<string>(
    'Token is not defined',
    Config.get('token'),
    BRIDGE_TOKEN
  )
} as IConfig;
