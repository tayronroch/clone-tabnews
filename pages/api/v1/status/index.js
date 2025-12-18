import database from "infra/database.js";

async function status(request, response) {
  const result = await database.query("SELECT 1 as status");
  console.log(result);
  response.status(200).json({ status: "São acima da Média" });
  return;
}

export default status;
