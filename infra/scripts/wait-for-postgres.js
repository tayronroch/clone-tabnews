const { exec } = require("node:child_process");

function checkPostgres() {
  exec(
    "docker exec clone-tabnews-db pg_isready --host localhost",
    handleResult,
  );

  function handleResult(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }
    console.log("\n\n🟢 PostgreSQL está pronto para conexões!");
  }
}

process.stdout.write("\n\n🔴 Aguardando o PostgreSQL aceitar conexões...");
checkPostgres();
