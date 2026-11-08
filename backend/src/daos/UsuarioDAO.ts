import { prisma } from "../database/prisma";

// DAO: única camada que acessa a tabela Usuario.
export const UsuarioDAO = {
  buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email }, include: { aluno: true } });
  },

  buscarPorId(id: number) {
    return prisma.usuario.findUnique({ where: { id }, include: { aluno: true } });
  },

  atualizarSenha(id: number, senhaHash: string) {
    return prisma.usuario.update({ where: { id }, data: { senhaHash, trocarSenha: false } });
  },
};
