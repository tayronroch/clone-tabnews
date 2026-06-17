export class InternalServerError extends Error {
  constructor({ cause } = {}) {
    super("Um erro interno não esperado aconteceu.", {
      cause,
    });

    this.name = "InternalServerError";

    this.action = "Entre em contato com o suporte.";

    this.statusCode = 500;
  }

  toJSON() {
    return {
      name: this.name,

      message: this.message,

      action: this.action,

      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor({ cause, message } = {}) {
    super(message || "The HTTP method is not allowed for this endpoint.", {
      cause,
    });

    this.name = "MethodNotAllowedError";

    this.action =
      "Verify to be method is correct and supported by this endpoint.";

    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,

      message: this.message,

      action: this.action,

      status_code: this.statusCode,
    };
  }
}
