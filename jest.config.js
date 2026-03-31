const path = require("path");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const nextJest = require("next/jest");

dotenvExpand.expand(
  dotenv.config({
  path: path.resolve(__dirname, ".env.development"),
  override: true,
}),
);

process.env.POSTGRES_SSL = "false";
process.env.PGSSLMODE = "disable";

if (process.env.DATABASE_URL) {
  try {
    const databaseUrl = new URL(process.env.DATABASE_URL);

    [
      "ssl",
      "sslmode",
      "sslcert",
      "sslkey",
      "sslrootcert",
      "sslaccept",
    ].forEach((parameter) => {
      databaseUrl.searchParams.delete(parameter);
    });

    process.env.DATABASE_URL = databaseUrl.toString();
  } catch {
    // Mantem o valor original caso a URL nao possa ser parseada.
  }
}

const createJestConfig = nextJest({
  dir: ".",
});

const JestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironment: "node",
});

module.exports = JestConfig;
