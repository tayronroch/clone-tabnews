import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(request.method)) {
    response.setHeader("Allow", allowedMethods);
    return response.status(405).json({ error: "Method not allowed" });
  }

  const dbClient = await database.getNewClient();

  try {
    const defaultMigrationsOptions = {
      dbClient,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "migrations",
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

      return response.status(result.length > 0 ? 201 : 200).json(result);
    }
  } catch (error) {
    console.error("Erro na rota de migrations:", error);

    const isProduction = process.env.NODE_ENV === "production";

    return response.status(500).json({
      error: isProduction ? "Internal server error" : error.message,
      ...(isProduction ? {} : { stack: error.stack }),
    });
  } finally {
    await dbClient.end();
  }
}
