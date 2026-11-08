import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api";
import { useState } from "react";

// ViewModel da tela de login: estado do formulário, validação e ação de entrar.
export function useLoginViewModel() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<{ email?: string; senha?: string; geral?: string }>({});

  function validar() {
    const novos: typeof erros = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) novos.email = "Informe um e-mail válido.";
    if (!senha) novos.senha = "Informe a senha.";
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function onEntrar() {
    if (!validar()) return;
    setCarregando(true);
    try {
      await entrar(email.trim(), senha);
    } catch (e) {
      setErros({ geral: e instanceof ApiError ? e.message : "Não foi possível entrar." });
    } finally {
      setCarregando(false);
    }
  }

  return {
    email,
    setEmail,
    senha,
    setSenha,
    mostrarSenha,
    alternarMostrarSenha: () => setMostrarSenha((v) => !v),
    carregando,
    erros,
    onEntrar,
  };
}
