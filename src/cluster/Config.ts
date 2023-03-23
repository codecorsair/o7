import { GenericConfig } from '@/shared/GenericConfig';
import { assert } from '@/shared/utils/assert';

const {
  CLUSTER_AGENT,
  CLUSTER_HOST,
  CLUSTER_PORT,
  CLUSTER_HANDSHAKE,
  CLUSTER_AUTH_TOKEN,
  CLUSTER_ROLLING_RESTARTS
} = process.env;

export interface IConfig {
  agent: string;
  host: string;
  port: number;
  handshake: boolean;
  authToken: string;
  rollingRestarts: boolean;
}

const Config = new GenericConfig<IConfig>('cluster.json');

export default {
  agent: assert<string>(
    'Agent is not defined',
    CLUSTER_AGENT,
    Config.get('agent')
  ),
  host: assert<string>('Host is not defined', CLUSTER_HOST, Config.get('host'), '127.0.0.1'),
  port: assert<number>('Port is not defined', CLUSTER_PORT, Config.get('port'), 4444),
  handshake: assert<boolean>(
    'Handshake is not defined',
    CLUSTER_HANDSHAKE,
    Config.get('handshake'),
    false
  ),
  authToken: assert<string>(
    'Auth token is not defined',
    CLUSTER_AUTH_TOKEN,
    Config.get('authToken')
  ),
  rollingRestarts: assert<boolean>(
    'Rolling restarts is not defined',
    CLUSTER_ROLLING_RESTARTS,
    Config.get('rollingRestarts'),
    false
  )
} as IConfig;
