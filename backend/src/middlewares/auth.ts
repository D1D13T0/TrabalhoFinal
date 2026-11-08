import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

export type Perfil = "ADMIN" | "ALUNO";

export interface UsuarioToken {
  id: number;
  perfil: Perfil;
  alunoId: number | null;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioToken;
    }
  }
}

export function gerarToken(usuario: UsuarioToken): string {
  return jwt.sign(usuario, env.jwtSecret, { expiresIn: "7d" });
}

// Exige o header "Authorization: Bearer <token>".
export function autenticar(req: Request, _res: Response, next: NextFunction) {
  const [tipo, token] = req.headers.authorization?.split(" ") ?? [];
  if (tipo !== "Bearer" || !token) {
    throw new AppError("Token não informado.", 401);
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as UsuarioToken;
    req.usuario = { id: payload.id, perfil: payload.perfil, alunoId: payload.alunoId };
    next();
  } catch {
    throw new AppError("Token inválido ou expirado.", 401);
  }
}

export function exigirPerfil(perfil: Perfil) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.usuario?.perfil !== perfil) {
      throw new AppError("Acesso não permitido para este perfil.", 403);
    }
    next();
  };
}

// Usuário logado (use apenas em rotas que passaram por autenticar).
export function usuarioLogado(req: Request): UsuarioToken {
  if (!req.usuario) throw new AppError("Não autenticado.", 401);
  return req.usuario;
}
