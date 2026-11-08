// Erro de regra de negócio com status HTTP, tratado pelo errorHandler.
export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

export class NaoEncontradoError extends AppError {
  constructor(recurso: string) {
    super(`${recurso} não encontrado(a).`, 404);
  }
}
