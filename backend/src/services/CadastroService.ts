import { AlunoDAO } from "../daos/AlunoDAO";
import { ExercicioDAO } from "../daos/ExercicioDAO";
import { PagamentoDAO } from "../daos/PagamentoDAO";
import { PlanoDAO } from "../daos/PlanoDAO";
import { TreinoDAO } from "../daos/TreinoDAO";
import { AppError, NaoEncontradoError } from "../errors/AppError";
import { removerUpload } from "../utils/arquivos";
import type { ExercicioInput, PagamentoInput, PlanoInput, TreinoInput } from "../validators/schemas";

// Regras de negócio dos cadastros de Planos, Exercícios, Treinos e Pagamentos.

async function garantir<T>(registro: Promise<T | null>, nome: string): Promise<T> {
  const r = await registro;
  if (!r) throw new NaoEncontradoError(nome);
  return r;
}

export const PlanoService = {
  buscar: (id: number) => garantir(PlanoDAO.buscarPorId(id), "Plano"),
  criar: (dados: PlanoInput) => PlanoDAO.criar(dados),
  async atualizar(id: number, dados: PlanoInput) {
    await this.buscar(id);
    return PlanoDAO.atualizar(id, dados);
  },
  async excluir(id: number) {
    await this.buscar(id);
    const alunos = await PlanoDAO.contarAlunos(id);
    if (alunos > 0) {
      throw new AppError(`Este plano possui ${alunos} aluno(s). Troque o plano deles ou desative o plano.`, 409);
    }
    await PlanoDAO.excluir(id);
  },
};

export const ExercicioService = {
  buscar: (id: number) => garantir(ExercicioDAO.buscarPorId(id), "Exercício"),
  criar: (dados: ExercicioInput) => ExercicioDAO.criar(dados),
  async atualizar(id: number, dados: ExercicioInput) {
    await this.buscar(id);
    return ExercicioDAO.atualizar(id, dados);
  },
  async atualizarImagem(id: number, arquivo: string) {
    const anterior = await this.buscar(id);
    const exercicio = await ExercicioDAO.atualizarImagem(id, arquivo);
    await removerUpload(anterior.imagem);
    return exercicio;
  },
  async excluir(id: number) {
    const exercicio = await this.buscar(id);
    const usos = await ExercicioDAO.contarUsoEmTreinos(id);
    if (usos > 0) {
      throw new AppError(`Este exercício está em ${usos} treino(s). Remova-o dos treinos ou desative-o.`, 409);
    }
    await ExercicioDAO.excluir(id);
    await removerUpload(exercicio.imagem);
  },
};

async function validarTreino(dados: TreinoInput) {
  await garantir(AlunoDAO.buscarPorId(dados.alunoId), "Aluno");
  for (const item of dados.itens) {
    await garantir(ExercicioDAO.buscarPorId(item.exercicioId), `Exercício ${item.exercicioId}`);
  }
}

export const TreinoService = {
  buscar: (id: number) => garantir(TreinoDAO.buscarPorId(id), "Treino"),
  async criar(dados: TreinoInput) {
    await validarTreino(dados);
    return TreinoDAO.criar(dados);
  },
  async atualizar(id: number, dados: TreinoInput) {
    await this.buscar(id);
    await validarTreino(dados);
    return TreinoDAO.atualizar(id, dados);
  },
  async excluir(id: number) {
    await this.buscar(id);
    await TreinoDAO.excluir(id);
  },
};

function validarPagamento(dados: PagamentoInput) {
  if (dados.pago && !dados.dataPagamento) {
    throw new AppError("Informe a data do pagamento.");
  }
  return { ...dados, dataPagamento: dados.pago ? dados.dataPagamento : null };
}

export const PagamentoService = {
  buscar: (id: number) => garantir(PagamentoDAO.buscarPorId(id), "Pagamento"),
  async criar(dados: PagamentoInput) {
    await garantir(AlunoDAO.buscarPorId(dados.alunoId), "Aluno");
    if (await PagamentoDAO.buscarDoMes(dados.alunoId, dados.mesReferencia)) {
      throw new AppError(`Já existe um pagamento deste aluno para ${dados.mesReferencia}.`, 409);
    }
    return PagamentoDAO.criar(validarPagamento(dados));
  },
  async atualizar(id: number, dados: PagamentoInput) {
    await this.buscar(id);
    return PagamentoDAO.atualizar(id, validarPagamento(dados));
  },
  async excluir(id: number) {
    await this.buscar(id);
    await PagamentoDAO.excluir(id);
  },
};
