import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status da Aplicação</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleTimeString("pt-BR");
  }
  return <p>Última atualização: {updatedAtText}</p>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading || !data) {
    return <p>Carregando dados do banco de dados...</p>;
  }

  const { version, max_connections, opened_connections } =
    data.dependencies.database;

  return (
    <>
      <h2>Banco de Dados</h2>
      <ul>
        <li>Versão: {version}</li>
        <li>Conexões Máximas: {max_connections}</li>
        <li>Conexões Abertas: {opened_connections}</li>
      </ul>
    </>
  );
}
