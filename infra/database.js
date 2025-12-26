import { Client, Pool } from "pg";

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      ssl: getSSLValues(),
    });
  }

  return pool;
}

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return { ca: process.env.POSTGRES_CA };
  }

  if (process.env.POSTGRES_SSL === "true") {
    return { rejectUnauthorized: false };
  }

  return false;
}

async function query(queryObject) {
  // SEGURANCA: Evite strings interpoladas; prefira queries parametrizadas.
  const client = await getPool().connect();
  try {
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error("Erro ao executar query no banco:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  await client.connect();
  return client;
}

// Executa uma funcao callback com um cliente do pool
async function withClient(callback) {
  const client = await getPool().connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

const database = {
  query,
  getNewClient,
  withClient,
};

export default database;
