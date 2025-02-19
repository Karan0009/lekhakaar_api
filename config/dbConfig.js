const dbConfig = {
  development: {
    username: process.env.PG_DB_USERNAME,
    password: process.env.PG_DB_PASSWORD,
    database: process.env.PG_DB_NAME,
    host: process.env.PG_DB_HOST,
    port: process.env.PG_DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.PG_DB_SSL_MODE === 'true',
    },
  },
  test: {
    username: 'fabnest-test',
    password: 'fabnest-test',
    database: 'lekhakaar',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  production: {
    username: 'fabnest-test',
    password: 'fabnest-test',
    database: 'lekhakaar',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
};

export default dbConfig;
