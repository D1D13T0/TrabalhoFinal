import { prisma } from "../database/prisma";
import type { TreinoInput } from "../validators/schemas";

const incluir = {
  aluno: { select: { id: true, usuario: { select: { nome: true } } } },
  itens: { include: { exercicio: true }, orderBy: { ordem: "asc" } },
} as const;

// A ordem dos exercícios segue a posição na lista enviada.
function itensComOrdem(itens: TreinoInput["itens"]) {
  return itens.map((item, indice) => ({ ...item, ordem: indice + 1 }));
}

export const TreinoDAO = {
  listar(filtro: { alunoId?: number; busca?: string; ativo?: boolean }) {
    return prisma.treino.findMany({
      where: {
        alunoId: filtro.alunoId,
        ativo: filtro.ativo,
        OR: filtro.busca
          ? [{ nome: { contains: filtro.busca } }, { aluno: { usuario: { nome: { contains: filtro.busca } } } }]
          : undefined,
      },
      include: incluir,
      orderBy: [{ alunoId: "asc" }, { nome: "asc" }],
    });
  },

  buscarPorId(id: number) {
    return prisma.treino.findUnique({ where: { id }, include: incluir });
  },

  criar(dados: TreinoInput) {
    const { itens, ...treino } = dados;
    return prisma.treino.create({
      data: { ...treino, itens: { create: itensComOrdem(itens) } },
      include: incluir,
    });
  },

  // Substitui todos os exercícios do treino pela nova lista.
  atualizar(id: number, dados: TreinoInput) {
    const { itens, ...treino } = dados;
    return prisma.treino.update({
      where: { id },
      data: { ...treino, itens: { deleteMany: {}, create: itensComOrdem(itens) } },
      include: incluir,
    });
  },

  excluir(id: number) {
    return prisma.treino.delete({ where: { id } });
  },
};
