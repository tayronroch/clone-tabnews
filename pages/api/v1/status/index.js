import database from "infra/database.js";
import { InternalServerError } from "infra/error.js";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();
    return await database.withClient(async (client) => {
      const databaseVersionResult = await client.query("SHOW server_version;");
      const databaseVersionValue = databaseVersionResult.rows[0].server_version;

      const databaseMaxConnectionsResult = await client.query(
        "SHOW max_connections;",
      );
      const databaseMaxConnectionsValue =
        databaseMaxConnectionsResult.rows[0].max_connections;

      const databaseName = process.env.POSTGRES_DB;

      const databaseOpenedConnectionsResult = await client.query({
        text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1 AND pid = pg_backend_pid();",
        values: [databaseName],
      });

      const databaseOpenedConnectionsValue = parseInt(
        databaseOpenedConnectionsResult.rows[0].count,
      );

      return response.status(200).json({
        updated_at: updatedAt,
        dependencies: {
          database: {
            version: databaseVersionValue,
            max_connections: parseInt(databaseMaxConnectionsValue),
            opened_connections: databaseOpenedConnectionsValue,
          },
        },
      });
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({ cause: error });
    console.error(publicErrorObject);
    return response.status(500).json(publicErrorObject);
  }
}

export default status;
