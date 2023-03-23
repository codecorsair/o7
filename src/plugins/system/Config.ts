import { GenericConfig } from '@/shared/GenericConfig';
import { assert } from '@/shared/utils/assert';

const {
  PLUGIN_EVE_ECHOES_MONGO_CONNECTION_STRING,
  PLUGIN_EVE_ECHOES_MONGO_DATABASE
} = process.env;

export interface IConfig {
  mongo: {
    connectionString: string;
    database: string;
  };
}

const Config = new GenericConfig<IConfig>('eve_echoes.json');

export default {
  mongo: {
    connectionString: assert(
      `Configure Mongo connection string using the "mongo.connectionString" key in the config file or the "PLUGIN_EVE_ECHOES_MONGO_CONNECTION_STRING" environment variable.`,
      String(PLUGIN_EVE_ECHOES_MONGO_CONNECTION_STRING),
      Config.get('mongo.connectionString')
    ),
    database: assert(
      `Configure Mongo database using the "mongo.database" key in the config file or the "PLUGIN_EVE_ECHOES_MONGO_DATABASE" environment variable.`,
      String(PLUGIN_EVE_ECHOES_MONGO_DATABASE),
      Config.get('mongo.database')
    )
  }
} as IConfig;
