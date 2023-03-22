import { GenericConfig } from '../shared/GenericConfig';
import { assert } from '../shared/Utils/assert';

const {
  CLUSTER_AGENT,
  CLUSTER_HOST,
  CLUSTER_PORT,
  CLUSTER_HANDSHAKE,
  CLUSTER_AUTH_TOKEN,
  CLUSTER_ROLLING_RESTARTS,
} = process.env;

export interface IConfig {
  agent: string;
  host: string;
  port: number;
  handshake: boolean;
  authToken: string;
  rollingRestarts: boolean;
}

const Config = new GenericConfig<IConfig>("cluster.json");

export default {
  agent: assert<string>("Agent is not defined", Config.get("agent"), CLUSTER_AGENT),
  host: assert<string>("Host is not defined", Config.get("host"), CLUSTER_HOST),
  port: assert<number>("Port is not defined", Config.get("port"), CLUSTER_PORT),
  handshake: assert<boolean>("Handshake is not defined", Config.get("handshake"), CLUSTER_HANDSHAKE),
  authToken: assert<string>("Auth token is not defined", Config.get("authToken"), CLUSTER_AUTH_TOKEN),
  rollingRestarts: assert<boolean>("Rolling restarts is not defined", Config.get("rollingRestarts"), CLUSTER_ROLLING_RESTARTS),
} as IConfig;