import type { Request, Response } from "express";
import { ExercicioDAO } from "../daos/ExercicioDAO";
import { PagamentoDAO } from "../daos/PagamentoDAO";
import { PlanoDAO } from "../daos/PlanoDAO";
import { TreinoDAO } from "../daos/TreinoDAO";
import { AlunoService } from "../services/AlunoService";
import { ExercicioService, PagamentoService, PlanoService, TreinoService } from "../services/CadastroService";
import { MensalidadeService } from "../services/MensalidadeService";
import { arquivoEnviado, booleanoQuery, idParam, numeroQuery, textoQuery } from "../utils/query";
import {
  alunoAtualizarSchema,
  alunoCriarSchema,
  exercicioSchema,
  pagamentoSchema,
  planoSchema,
  treinoSchema,
} from "../validators/schemas";

// Controllers das rotas do perfil ADMIN: recebem a requisição, validam e chamam os services/DAOs.

export const PlanoController = {
  async listar(req: Request, res: Response) {
    res.json(await PlanoDAO.listar({ busca: textoQuery(req, "busca"), ativo: booleanoQuery(req, "ativo") }));
  },
  async buscar(req: Request, res: Response) {
    res.json(await PlanoService.buscar(idParam(req)));
  },
  async criar(req: Request, res: Response) {
    res.status(201).json(await PlanoService.criar(planoSchema.parse(req.body)));
  },
  async atualizar(req: Request, res: Response) {
    res.json(await PlanoService.atualizar(idParam(req), planoSchema.parse(req.body)));
  },
  async excluir(req: Request, res: Response) {
    await PlanoService.excluir(idParam(req));
    res.status(204).end();
  },
};

export const AlunoController = {
  async listar(req: Request, res: Response) {
    res.json(await AlunoService.listar({ busca: textoQuery(req, "busca"), ativo: booleanoQuery(req, "ativo") }));
  },
  async buscar(req: Request, res: Response) {
    res.json(await AlunoService.buscar(idParam(req)));
  },
  async criar(req: Request, res: Response) {
    res.status(201).json(await AlunoService.criar(alunoCriarSchema.parse(req.body)));
  },
  async atualizar(req: Request, res: Response) {
    res.json(await AlunoService.atualizar(idParam(req), alunoAtualizarSchema.parse(req.body)));
  },
  async enviarFoto(req: Request, res: Response) {
    res.json(await AlunoService.atualizarFoto(idParam(req), arquivoEnviado(req)));
  },
  async excluir(req: Request, res: Response) {
    await AlunoService.excluir(idParam(req));
    res.status(204).end();
  },
  async mensalidade(req: Request, res: Response) {
    res.json(await MensalidadeService.statusDoAluno(idParam(req)));
  },
};

export const ExercicioController = {
  async listar(req: Request, res: Response) {
    res.json(
      await ExercicioDAO.listar({
        busca: textoQuery(req, "busca"),
        grupoMuscular: textoQuery(req, "grupoMuscular"),
        ativo: booleanoQuery(req, "ativo"),
      }),
    );
  },
  async buscar(req: Request, res: Response) {
    res.json(await ExercicioService.buscar(idParam(req)));
  },
  async criar(req: Request, res: Response) {
    res.status(201).json(await ExercicioService.criar(exercicioSchema.parse(req.body)));
  },
  async atualizar(req: Request, res: Response) {
    res.json(await ExercicioService.atualizar(idParam(req), exercicioSchema.parse(req.body)));
  },
  async enviarImagem(req: Request, res: Response) {
    res.json(await ExercicioService.atualizarImagem(idParam(req), arquivoEnviado(req)));
  },
  async excluir(req: Request, res: Response) {
    await ExercicioService.excluir(idParam(req));
    res.status(204).end();
  },
};

export const TreinoController = {
  async listar(req: Request, res: Response) {
    res.json(
      await TreinoDAO.listar({
        alunoId: numeroQuery(req, "alunoId"),
        busca: textoQuery(req, "busca"),
        ativo: booleanoQuery(req, "ativo"),
      }),
    );
  },
  async buscar(req: Request, res: Response) {
    res.json(await TreinoService.buscar(idParam(req)));
  },
  async criar(req: Request, res: Response) {
    res.status(201).json(await TreinoService.criar(treinoSchema.parse(req.body)));
  },
  async atualizar(req: Request, res: Response) {
    res.json(await TreinoService.atualizar(idParam(req), treinoSchema.parse(req.body)));
  },
  async excluir(req: Request, res: Response) {
    await TreinoService.excluir(idParam(req));
    res.status(204).end();
  },
};

export const PagamentoController = {
  async listar(req: Request, res: Response) {
    res.json(
      await PagamentoDAO.listar({
        alunoId: numeroQuery(req, "alunoId"),
        pago: booleanoQuery(req, "pago"),
        mesReferencia: textoQuery(req, "mes"),
        busca: textoQuery(req, "busca"),
      }),
    );
  },
  async buscar(req: Request, res: Response) {
    res.json(await PagamentoService.buscar(idParam(req)));
  },
  async criar(req: Request, res: Response) {
    res.status(201).json(await PagamentoService.criar(pagamentoSchema.parse(req.body)));
  },
  async atualizar(req: Request, res: Response) {
    res.json(await PagamentoService.atualizar(idParam(req), pagamentoSchema.parse(req.body)));
  },
  async excluir(req: Request, res: Response) {
    await PagamentoService.excluir(idParam(req));
    res.status(204).end();
  },
};

export const DashboardController = {
  async resumo(_req: Request, res: Response) {
    res.json(await MensalidadeService.dashboard());
  },
};
