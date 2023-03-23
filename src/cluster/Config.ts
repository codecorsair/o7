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
    `Configure cluster agent using the "agent" key in the config file or the "CLUSTER_AGENT" environment variable.`,
    CLUSTER_AGENT,
    Config.get('agent')
  ),
  host: assert<string>(
    `Configure cluster host using the "host" key in the config file or the "CLUSTER_HOST" environment variable.`,
    CLUSTER_HOST,
    Config.get('host'),
    '127.0.0.1'
  ),
  port: assert<number>(
    `Configure cluster port using the "port" key in the config file or the "CLUSTER_PORT" environment variable.`,
    CLUSTER_PORT && parseInt(CLUSTER_PORT as string),
    Config.get('port'),
    4444
  ),
  handshake: assert<boolean>(
    `Configure cluster handshake using the "handshake" key in the config file or the "CLUSTER_HANDSHAKE" environment variable.`,
    CLUSTER_HANDSHAKE && (CLUSTER_HANDSHAKE.toLowerCase() === 'true' || parseInt(CLUSTER_HANDSHAKE as string) === 1),
    Config.get('handshake'),
    false
  ),
  authToken: assert<string>(
    `Configure cluster auth token using the "authToken" key in the config file or the "CLUSTER_AUTH_TOKEN" environment variable.`,
    CLUSTER_AUTH_TOKEN,
    Config.get('authToken')
  ),
  rollingRestarts: assert<boolean>(
    `Configure cluster rolling restarts using the "rollingRestarts" key in the config file or the "CLUSTER_ROLLING_RESTARTS" environment variable.`,
    CLUSTER_ROLLING_RESTARTS && (CLUSTER_ROLLING_RESTARTS.toLowerCase() === 'true' || parseInt(CLUSTER_ROLLING_RESTARTS as string) === 1),
    Config.get('rollingRestarts'),
    false
  )
} as IConfig;
