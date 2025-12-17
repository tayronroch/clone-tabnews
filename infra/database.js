import { Client } from "pg";

async function query(queryObject) {
  const client = new Client({
    host: "localhost",
    port: process.env.DB_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });
  await client.connect();
  const result = await client.query(queryObject);
  await client.end();
  return result;
}
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  query: query,
};
// module.exports = { query  };
