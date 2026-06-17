import { Client, Pool } from "pg";

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool(getPoolConfig());
  }

  return pool;
}

function getPoolConfig() {
  const connectionString = getConnectionString();
  const ssl = getSSLValues();
  const allowExitOnIdle = process.env.NODE_ENV === "test";

  if (connectionString) {
    const config = { connectionString, allowExitOnIdle };
    if (ssl) {
      config.ssl = ssl;
    }
    return config;
  }

  return {
    allowExitOnIdle,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl,
  };
}

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || process.env.NODE_ENV === "production") {
    return connectionString;
  }

  try {
    const databaseUrl = new URL(connectionString);

    ["ssl", "sslmode", "sslcert", "sslkey", "sslrootcert", "sslaccept"].forEach(
      (parameter) => {
        databaseUrl.searchParams.delete(parameter);
      },
    );

    return databaseUrl.toString();
  } catch {
    return connectionString;
  }
}

function getSSLValues() {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  if (process.env.POSTGRES_CA) {
    return { ca: process.env.POSTGRES_CA };
  }

  if (process.env.POSTGRES_SSL === "true") {
    return { rejectUnauthorized: false };
  }

  return false;
}

async function query(queryObject) {
  const client = await getPool().connect();
  try {
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.log("\n Erro ao executar query no database.js:", error);
    console.error(error);
    throw error;
  } finally {
    await client?.end();
  }
}

async function getNewClient() {
  const client = new Client(getPoolConfig());

  await client.connect();
  return client;
}

async function withClient(callback) {
  const client = await getPool().connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

async function closePool() {
  if (!pool) {
    return;
  }

  const currentPool = pool;
  pool = undefined;
  await currentPool.end();
}

const database = {
  closePool,
  query,
  getNewClient,
  withClient,
};

export default database;
