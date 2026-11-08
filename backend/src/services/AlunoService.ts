import { AlunoDAO } from "../daos/AlunoDAO";
import { PlanoDAO } from "../daos/PlanoDAO";
import { AppError, NaoEncontradoError } from "../errors/AppError";
import type { AlunoAtualizarInput, AlunoCriarInput } from "../validators/schemas";
import { removerUpload } from "../utils/arquivos";
import { AuthService } from "./AuthService";

type AlunoBanco = NonNullable<Awaited<ReturnType<typeof AlunoDAO.buscarPorId>>>;

// Converte "SEG,QUA,SEX" em ["SEG","QUA","SEX"] para a resposta da API.
export function formatarAluno(aluno: AlunoBanco) {
  return { ...aluno, diasTreino: aluno.diasTreino ? aluno.diasTreino.split(",") : [] };
}

// Regra: o plano deve existir e a quantidade de dias marcados deve bater com o plano.
async function validarPlano(dados: AlunoAtualizarInput) {
  const plano = await PlanoDAO.buscarPorId(dados.planoId);
  if (!plano) throw new NaoEncontradoError("Plano");
  if (dados.diasTreino.length !== plano.diasPorSemana) {
    throw new AppError(
      `O plano "${plano.nome}" permite ${plano.diasPorSemana} dia(s) por semana; foram marcados ${dados.diasTreino.length}.`,
    );
  }
}

export const AlunoService = {
  async listar(filtro: { busca?: string; ativo?: boolean }) {
    return (await AlunoDAO.listar(filtro)).map(formatarAluno);
  },

  async buscar(id: number) {
    const aluno = await AlunoDAO.buscarPorId(id);
    if (!aluno) throw new NaoEncontradoError("Aluno");
    return formatarAluno(aluno);
  },

  async criar(dados: AlunoCriarInput) {
    await validarPlano(dados);
    const senhaHash = await AuthService.hashSenha(dados.senhaInicial);
    return formatarAluno(await AlunoDAO.criar(dados, senhaHash));
  },

  async atualizar(id: number, dados: AlunoAtualizarInput) {
    const atual = await this.buscar(id);
    await validarPlano(dados);
    return formatarAluno(await AlunoDAO.atualizar(id, atual.usuarioId, dados));
  },

  async atualizarFoto(id: number, arquivo: string) {
    const anterior = await this.buscar(id);
    const aluno = formatarAluno(await AlunoDAO.atualizarFoto(id, arquivo));
    await removerUpload(anterior.foto);
    return aluno;
  },

  async excluir(id: number) {
    const aluno = await this.buscar(id);
    await AlunoDAO.excluir(aluno.usuarioId);
    await removerUpload(aluno.foto);
  },
};
