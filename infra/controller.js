import { InternalServerError, MethodNotAllowedError } from "infra/error.js";

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError({
    message: `The HTTP method ${request.method} is not allowed for this endpoint.`,
  });
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.log("\nErro dentro do catch:");
  console.error(error);
  console.error(publicErrorObject);

  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
