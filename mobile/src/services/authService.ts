import type { Sessao, Usuario } from "@/models";
import { api } from "./api";

export const authService = {
  login: (email: string, senha: string) => api.post<Sessao>("/auth/login", { email, senha }),
  me: () => api.get<Usuario>("/auth/me"),
  trocarSenha: (senhaAtual: string, novaSenha: string) => api.put<void>("/auth/senha", { senhaAtual, novaSenha }),
};
