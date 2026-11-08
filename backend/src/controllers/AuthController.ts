import type { Request, Response } from "express";
import { usuarioLogado } from "../middlewares/auth";
import { AuthService } from "../services/AuthService";
import { loginSchema, trocarSenhaSchema } from "../validators/schemas";

export const AuthController = {
  async login(req: Request, res: Response) {
    const { email, senha } = loginSchema.parse(req.body);
    res.json(await AuthService.login(email, senha));
  },

  async me(req: Request, res: Response) {
    res.json(await AuthService.me(usuarioLogado(req).id));
  },

  async trocarSenha(req: Request, res: Response) {
    const { senhaAtual, novaSenha } = trocarSenhaSchema.parse(req.body);
    await AuthService.trocarSenha(usuarioLogado(req).id, senhaAtual, novaSenha);
    res.status(204).end();
  },
};
