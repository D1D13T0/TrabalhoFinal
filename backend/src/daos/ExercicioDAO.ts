import { prisma } from "../database/prisma";
import type { ExercicioInput } from "../validators/schemas";

export const ExercicioDAO = {
  listar(filtro: { busca?: string; grupoMuscular?: string; ativo?: boolean }) {
    return prisma.exercicio.findMany({
      where: {
        nome: filtro.busca ? { contains: filtro.busca } : undefined,
        grupoMuscular: filtro.grupoMuscular,
        ativo: filtro.ativo,
      },
      orderBy: [{ grupoMuscular: "asc" }, { nome: "asc" }],
    });
  },

  buscarPorId(id: number) {
    return prisma.exercicio.findUnique({ where: { id } });
  },

  contarUsoEmTreinos(id: number) {
    return prisma.treinoExercicio.count({ where: { exercicioId: id } });
  },

  criar(dados: ExercicioInput) {
    return prisma.exercicio.create({ data: dados });
  },

  atualizar(id: number, dados: ExercicioInput) {
    return prisma.exercicio.update({ where: { id }, data: dados });
  },

  atualizarImagem(id: number, imagem: string) {
    return prisma.exercicio.update({ where: { id }, data: { imagem } });
  },

  excluir(id: number) {
    return prisma.exercicio.delete({ where: { id } });
  },
};
