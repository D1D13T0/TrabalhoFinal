import { prisma } from "../database/prisma";
import type { PlanoInput } from "../validators/schemas";

export const PlanoDAO = {
  listar(filtro: { busca?: string; ativo?: boolean }) {
    return prisma.plano.findMany({
      where: {
        nome: filtro.busca ? { contains: filtro.busca } : undefined,
        ativo: filtro.ativo,
      },
      include: { _count: { select: { alunos: true } } },
      orderBy: { diasPorSemana: "asc" },
    });
  },

  buscarPorId(id: number) {
    return prisma.plano.findUnique({ where: { id } });
  },

  contarAlunos(id: number) {
    return prisma.aluno.count({ where: { planoId: id } });
  },

  criar(dados: PlanoInput) {
    return prisma.plano.create({ data: dados });
  },

  atualizar(id: number, dados: PlanoInput) {
    return prisma.plano.update({ where: { id }, data: dados });
  },

  excluir(id: number) {
    return prisma.plano.delete({ where: { id } });
  },
};
