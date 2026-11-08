import bcrypt from "bcryptjs";
import { UsuarioDAO } from "../daos/UsuarioDAO";
import { AppError } from "../errors/AppError";
import { gerarToken, type Perfil } from "../middlewares/auth";

type UsuarioComAluno = NonNullable<Awaited<ReturnType<typeof UsuarioDAO.buscarPorId>>>;

// Dados públicos do usuário (nunca devolve o hash da senha).
function usuarioPublico(u: UsuarioComAluno) {
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    perfil: u.perfil as Perfil,
    trocarSenha: u.trocarSenha,
    alunoId: u.aluno?.id ?? null,
  };
}

export const AuthService = {
  hashSenha(senha: string) {
    return bcrypt.hash(senha, 10);
  },

  async login(email: string, senha: string) {
    const usuario = await UsuarioDAO.buscarPorEmail(email);
    const senhaOk = usuario ? await bcrypt.compare(senha, usuario.senhaHash) : false;
    if (!usuario || !senhaOk) {
      throw new AppError("E-mail ou senha incorretos.", 401);
    }
    if (usuario.aluno && !usuario.aluno.ativo) {
      throw new AppError("Cadastro inativo. Procure a academia.", 403);
    }
    const dados = usuarioPublico(usuario);
    return { token: gerarToken({ id: dados.id, perfil: dados.perfil, alunoId: dados.alunoId }), usuario: dados };
  },

  async me(usuarioId: number) {
    const usuario = await UsuarioDAO.buscarPorId(usuarioId);
    if (!usuario) throw new AppError("Usuário não encontrado.", 404);
    return usuarioPublico(usuario);
  },

  async trocarSenha(usuarioId: number, senhaAtual: string, novaSenha: string) {
    const usuario = await UsuarioDAO.buscarPorId(usuarioId);
    if (!usuario || !(await bcrypt.compare(senhaAtual, usuario.senhaHash))) {
      throw new AppError("Senha atual incorreta.", 400);
    }
    await UsuarioDAO.atualizarSenha(usuarioId, await this.hashSenha(novaSenha));
  },
};
