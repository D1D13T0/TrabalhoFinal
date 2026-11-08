import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../errors/AppError";

// Converte qualquer erro lançado nas rotas em uma resposta JSON { erro, detalhes? }.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      erro: "Dados inválidos.",
      detalhes: err.issues.map((i) => ({ campo: i.path.join("."), mensagem: i.message })),
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ erro: `Erro no upload: ${err.message}` });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ erro: "Já existe um registro com esses dados." });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ erro: "Registro não encontrado." });
    }
    if (err.code === "P2003") {
      return res.status(409).json({ erro: "Registro está em uso por outros cadastros." });
    }
  }

  console.error(err);
  return res.status(500).json({ erro: "Erro interno do servidor." });
}
