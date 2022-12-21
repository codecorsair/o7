import config from './config.json';

export default {
  dev: process.env.NODE_ENV !== 'production' || config.dev,
  owners: process.env.OWNERS?.split(',') || config.owners,
  token: process.env.DISCORD_TOKEN || config.token,
  prefix: process.env.PREFIX || config.prefix,
  mongo: {
    connectionString: process.env.MONGO_CONNECTION_STRING || config.mongo.connectionString,
    "database": process.env.MONGO_DATABASE || config.mongo.database,
  },
  neo4j: {
    uri: process.env.NEO4J_URI || config.neo4j.uri,
    database: process.env.NEO4J_DATABASE || config.neo4j.database,
    username: process.env.NEO4J_USERNAME || config.neo4j.username,
    password: process.env.NEO4J_PASSWORD || config.neo4j.password,
  },
  gcloud: {
    auth: {
      client_email: process.env.GCLOUD_AUTH_CLIENT_EMAIL || config.gcloud.auth.client_email,
      private_key: process.env.GCLOUD_AUTH_PRIVATE_KEY || config.gcloud.auth.private_key,
    },
    bucket: process.env.GCLOUD_BUCKET || config.gcloud.bucket,
  },
}