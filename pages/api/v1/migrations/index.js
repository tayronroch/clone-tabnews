import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  try {
    const defaultMigrationsOptions = {
      dbClient,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "migrations",
      noLock: true,
    };

    if (request.method === "GET") {
      const result = await migrationRunner({
        ...defaultMigrationsOptions,
        dryRun: true,
      });

      return response.status(200).json(result);
    }

    if (request.method === "POST") {
      const result = await migrationRunner({
        ...defaultMigrationsOptions,
        dryRun: false,
      });

      if (result.length > 0) {
        return response.status(201).json(result);
      }

      return response.status(200).json(result);
    }

    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Erro na rota de migrations:", error);
    return response
      .status(500)
      .json({ error: error.message, stack: error.stack });
  } finally {
    await dbClient.end();
  }
}
