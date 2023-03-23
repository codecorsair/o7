import { GenericConfig } from '@/shared/GenericConfig';
import { assert } from '@/shared/utils/assert';

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
      `Configure Neo4j URI using the "neo4j.uri" key in the config file or the "PLUGIN_EVE_ECHOES_NEO4J_URI" environment variable.`,
      String(PLUGIN_EVE_ECHOES_NEO4J_URI),
      Config.get('neo4j.uri')
    ),
    username: assert(
      `Configure Neo4j username using the "neo4j.username" key in the config file or the "PLUGIN_EVE_ECHOES_NEO4J_USER" environment variable.`,
      String(PLUGIN_EVE_ECHOES_NEO4J_USER),
      Config.get('neo4j.username')
    ),
    password: assert(
      `Configure Neo4j password using the "neo4j.password" key in the config file or the "PLUGIN_EVE_ECHOES_NEO4J_PASSWORD" environment variable.`,
      String(PLUGIN_EVE_ECHOES_NEO4J_PASSWORD),
      Config.get('neo4j.password'),
    )
  }
} as IConfig;
