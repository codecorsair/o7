import { GenericConfig } from '@/src/shared/GenericConfig';
import { assert } from '@/src/shared/utils/assert';

const {
  PLUGIN_EVE_ECHOES_NEO4J_URI,
  PLUGIN_EVE_ECHOES_NEO4J_USER,
  PLUGIN_EVE_ECHOES_NEO4J_PASSWORD
} = process.env;

export interface IConfig {
  neo4j: {
    uri: string;
    username: string;
    password: string;
  };
}

const Config = new GenericConfig<IConfig>('eve_echoes.json');

export default {
  neo4j: {
    uri: assert(
      'Neo4j uri not defined',
      Config.get('neo4j.uri'),
      PLUGIN_EVE_ECHOES_NEO4J_URI
    ),
    username: assert(
      'Neo4j username not defined',
      Config.get('neo4j.username'),
      PLUGIN_EVE_ECHOES_NEO4J_USER
    ),
    password: assert(
      'Neo4j password not defined',
      Config.get('neo4j.password'),
      PLUGIN_EVE_ECHOES_NEO4J_PASSWORD
    )
  }
} as IConfig;
