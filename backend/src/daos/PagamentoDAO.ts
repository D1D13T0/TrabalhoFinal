import { prisma } from "../database/prisma";
import type { PagamentoInput } from "../validators/schemas";

const incluirAluno = {
  aluno: { select: { id: true, usuario: { select: { nome: true } } } },
} as const;

export const PagamentoDAO = {
  listar(filtro: { alunoId?: number; pago?: boolean; mesReferencia?: string; busca?: string }) {
    return prisma.pagamento.findMany({
      where: {
        alunoId: filtro.alunoId,
        pago: filtro.pago,
        mesReferencia: filtro.mesReferencia,
        aluno: filtro.busca ? { usuario: { nome: { contains: filtro.busca } } } : undefined,
      },
      include: incluirAluno,
      orderBy: [{ mesReferencia: "desc" }, { id: "desc" }],
    });
  },

  buscarPorId(id: number) {
    return prisma.pagamento.findUnique({ where: { id }, include: incluirAluno });
  },

  buscarDoMes(alunoId: number, mesReferencia: string) {
    return prisma.pagamento.findUnique({ where: { alunoId_mesReferencia: { alunoId, mesReferencia } } });
  },

  somarRecebidoNoMes(mesReferencia: string) {
    return prisma.pagamento.aggregate({ where: { mesReferencia, pago: true }, _sum: { valor: true } });
  },

  criar(dados: PagamentoInput) {
    return prisma.pagamento.create({ data: dados, include: incluirAluno });
  },

  atualizar(id: number, dados: PagamentoInput) {
    return prisma.pagamento.update({ where: { id }, data: dados, include: incluirAluno });
  },

  excluir(id: number) {
    return prisma.pagamento.delete({ where: { id } });
  },
};
