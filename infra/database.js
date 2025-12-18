import { Client } from "pg";

async function query(queryObject) {
  const client = new Client({
    host: "localhost",
    port: process.env.development.DB_PORT,
    user: process.env.development.DB_USER,
    database: process.env.development.DB_NAME,
    password: process.env.development.DB_PASSWORD,
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
