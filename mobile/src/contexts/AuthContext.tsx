import type { Usuario } from "@/models";
import { ApiError, aoSessaoExpirar, definirToken } from "@/services/api";
import { armazenamento } from "@/services/armazenamento";
import { authService } from "@/services/authService";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const CHAVE_TOKEN = "perfformance.token";
const CHAVE_USUARIO = "perfformance.usuario";

interface AuthContextValor {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  senhaTrocada: () => void;
}

const AuthContext = createContext<AuthContextValor | null>(null);

// Mantém o usuário logado e restaura a sessão salva ao abrir o app.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Atualiza o usuário na tela e guarda uma cópia no celular (para abrir o app sem internet).
  const guardarUsuario = useCallback(async (u: Usuario) => {
    setUsuario(u);
    await armazenamento.salvar(CHAVE_USUARIO, JSON.stringify(u));
  }, []);

  const sair = useCallback(async () => {
    definirToken(null);
    setUsuario(null);
    await armazenamento.remover(CHAVE_TOKEN);
    await armazenamento.remover(CHAVE_USUARIO);
  }, []);

  useEffect(() => {
    aoSessaoExpirar(() => void sair());

    (async () => {
      try {
        const token = await armazenamento.ler(CHAVE_TOKEN);
        if (!token) return;
        definirToken(token);
        try {
          await guardarUsuario(await authService.me());
        } catch (e) {
          // 401 = token inválido/expirado: sai. Sem conexão: continua com o usuário salvo.
          const salvo = await armazenamento.ler(CHAVE_USUARIO);
          if (e instanceof ApiError && e.status === 0 && salvo) setUsuario(JSON.parse(salvo) as Usuario);
          else await sair();
        }
      } finally {
        setCarregando(false);
      }
    })();
  }, [sair, guardarUsuario]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const sessao = await authService.login(email, senha);
      definirToken(sessao.token);
      await armazenamento.salvar(CHAVE_TOKEN, sessao.token);
      await guardarUsuario(sessao.usuario);
    },
    [guardarUsuario],
  );

  const senhaTrocada = useCallback(() => {
    setUsuario((u) => {
      if (!u) return u;
      const atualizado = { ...u, trocarSenha: false };
      void armazenamento.salvar(CHAVE_USUARIO, JSON.stringify(atualizado));
      return atualizado;
    });
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, sair, senhaTrocada }),
    [usuario, carregando, entrar, sair, senhaTrocada],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  return ctx;
}
