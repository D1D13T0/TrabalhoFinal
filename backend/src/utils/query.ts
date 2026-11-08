import type { Request } from "express";
import { AppError } from "../errors/AppError";
import { idParamSchema } from "../validators/schemas";

// Helpers para ler parâmetros da URL (?busca=...&ativo=true, /:id).

export function textoQuery(req: Request, nome: string): string | undefined {
  const valor = req.query[nome];
  return typeof valor === "string" && valor.trim() !== "" ? valor.trim() : undefined;
}

export function booleanoQuery(req: Request, nome: string): boolean | undefined {
  const valor = textoQuery(req, nome);
  if (valor === "true") return true;
  if (valor === "false") return false;
  return undefined;
}

export function numeroQuery(req: Request, nome: string): number | undefined {
  const valor = textoQuery(req, nome);
  return valor === undefined ? undefined : idParamSchema.parse(valor);
}

export function idParam(req: Request): number {
  const resultado = idParamSchema.safeParse(req.params.id);
  if (!resultado.success) throw new AppError("ID inválido.");
  return resultado.data;
}

export function arquivoEnviado(req: Request): string {
  if (!req.file) throw new AppError('Envie a imagem no campo "imagem".');
  return req.file.filename;
}
