// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: "pg",
    connection: {
      host:'ep-white-grass-a1rsqh96-pooler.ap-southeast-1.aws.neon.tech',
      database: 'verceldb',
      user:     'default',
      password: 'jLY78JoWendi',
      ssl: { rejectUnauthorized: false }
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      host:'ep-white-grass-a1rsqh96-pooler.ap-southeast-1.aws.neon.tech',
      database: 'verceldb',
      user:     'default',
      password: 'jLY78JoWendi'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host:'ep-white-grass-a1rsqh96-pooler.ap-southeast-1.aws.neon.tech',
      database: 'verceldb',
      user:     'default',
      password: 'jLY78JoWendi'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
