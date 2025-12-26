import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  return await database.withClient(async (client) => {
    // coletar dados do banco de dados
    const databaseVersionResult = await client.query("SHOW server_version;");
    const databaseVersionValue = databaseVersionResult.rows[0].server_version;

    const databaseMaxConnectionsResult = await client.query(
      "SHOW max_connections;"
    );
    const databaseMaxConnectionsValue =
      databaseMaxConnectionsResult.rows[0].max_connections;
    // contar conexões abertas
    const databaseName = process.env.POSTGRES_DB;
    // SEGURANCA: Nao interpole valores controlados pelo usuario em SQL; use parametros.
    const databaseOpenedConnectionsResult = await client.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1 AND pid = pg_backend_pid();",
      values: [databaseName],
    });

    const databaseOpenedConnectionsValue = parseInt(
      databaseOpenedConnectionsResult.rows[0].count
    );

    // responder com os dados coletados
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
}

export default status;
