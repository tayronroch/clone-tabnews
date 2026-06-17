import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";

import { InternalServerError, MethodNotAllowedError } from "infra/error.js";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(request.method)) {
    const publicErrorObject = new MethodNotAllowedError({
      message: `The HTTP method ${request.method} is not
  allowed for this endpoint.`,
    });
    return response
      .status(publicErrorObject.statusCode)
      .json(publicErrorObject);
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
    const publicErrorObject = new InternalServerError({ cause: error });
    console.log("\nErro na rota de migrations:");
    console.error(error);
    console.error(publicErrorObject);
    return response.status(500).json(publicErrorObject);
  } finally {
    await dbClient.end();
  }
}
