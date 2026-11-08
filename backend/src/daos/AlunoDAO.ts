import { prisma } from "../database/prisma";
import type { AlunoAtualizarInput, AlunoCriarInput } from "../validators/schemas";

const incluir = {
  usuario: { select: { id: true, nome: true, email: true } },
  plano: true,
} as const;

// Separa os campos do Usuario (nome, email) dos campos do Aluno.
function camposAluno(dados: AlunoAtualizarInput) {
  const { nome: _nome, email: _email, diasTreino, ...resto } = dados;
  return { ...resto, diasTreino: diasTreino.join(",") };
}

export const AlunoDAO = {
  listar(filtro: { busca?: string; ativo?: boolean }) {
    return prisma.aluno.findMany({
      where: {
        ativo: filtro.ativo,
        usuario: filtro.busca ? { nome: { contains: filtro.busca } } : undefined,
      },
      include: incluir,
      orderBy: { usuario: { nome: "asc" } },
    });
  },

  // Alunos ativos com o pagamento (se existir) de um mês específico.
  listarAtivosComPagamentoDoMes(mesReferencia: string) {
    return prisma.aluno.findMany({
      where: { ativo: true },
      include: { ...incluir, pagamentos: { where: { mesReferencia } } },
    });
  },

  buscarPorId(id: number) {
    return prisma.aluno.findUnique({ where: { id }, include: incluir });
  },

  // Cria Usuario (login) + Aluno numa única transação.
  criar(dados: AlunoCriarInput, senhaHash: string) {
    const { senhaInicial: _senha, ...resto } = dados;
    const { planoId, ...campos } = camposAluno(resto);
    return prisma.aluno.create({
      data: {
        ...campos,
        plano: { connect: { id: planoId } },
        usuario: { create: { nome: dados.nome, email: dados.email, senhaHash, perfil: "ALUNO" } },
      },
      include: incluir,
    });
  },

  atualizar(id: number, usuarioId: number, dados: AlunoAtualizarInput) {
    return prisma.$transaction(async (tx) => {
      await tx.usuario.update({ where: { id: usuarioId }, data: { nome: dados.nome, email: dados.email } });
      return tx.aluno.update({ where: { id }, data: camposAluno(dados), include: incluir });
    });
  },

  atualizarFoto(id: number, foto: string) {
    return prisma.aluno.update({ where: { id }, data: { foto }, include: incluir });
  },

  // Excluir o usuário apaga o aluno, pagamentos e treinos em cascata.
  excluir(usuarioId: number) {
    return prisma.usuario.delete({ where: { id: usuarioId } });
  },
};
