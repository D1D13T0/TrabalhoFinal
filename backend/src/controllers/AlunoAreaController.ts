import type { Request, Response } from "express";
import { PagamentoDAO } from "../daos/PagamentoDAO";
import { TreinoDAO } from "../daos/TreinoDAO";
import { AppError } from "../errors/AppError";
import { usuarioLogado } from "../middlewares/auth";
import { AlunoService } from "../services/AlunoService";
import { MensalidadeService } from "../services/MensalidadeService";

// Rotas do perfil ALUNO: sempre usam o aluno do token, nunca um id vindo da URL.
function alunoId(req: Request): number {
  const { alunoId } = usuarioLogado(req);
  if (!alunoId) throw new AppError("Usuário não é um aluno.", 403);
  return alunoId;
}

export const AlunoAreaController = {
  async perfil(req: Request, res: Response) {
    res.json(await AlunoService.buscar(alunoId(req)));
  },
  async treinos(req: Request, res: Response) {
    res.json(await TreinoDAO.listar({ alunoId: alunoId(req), ativo: true }));
  },
  async pagamentos(req: Request, res: Response) {
    res.json(await PagamentoDAO.listar({ alunoId: alunoId(req) }));
  },
  async mensalidade(req: Request, res: Response) {
    res.json(await MensalidadeService.statusDoAluno(alunoId(req)));
  },
};
