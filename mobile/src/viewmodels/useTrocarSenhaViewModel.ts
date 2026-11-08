import { useAuth } from "@/contexts/AuthContext";
import { useMensagem } from "@/contexts/MensagemContext";
import { ApiError } from "@/services/api";
import { authService } from "@/services/authService";
import { useState } from "react";

export function useTrocarSenhaViewModel() {
  const { senhaTrocada, sair } = useAuth();
  const { mostrarMensagem } = useMensagem();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<{ senhaAtual?: string; novaSenha?: string; confirmacao?: string }>({});

  function validar() {
    const novos: typeof erros = {};
    if (!senhaAtual) novos.senhaAtual = "Informe a senha atual.";
    if (novaSenha.length < 6) novos.novaSenha = "A nova senha deve ter pelo menos 6 caracteres.";
    else if (novaSenha === senhaAtual) novos.novaSenha = "A nova senha deve ser diferente da atual.";
    if (confirmacao !== novaSenha) novos.confirmacao = "As senhas não conferem.";
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function onSalvar() {
    if (!validar()) return;
    setCarregando(true);
    try {
      await authService.trocarSenha(senhaAtual, novaSenha);
      mostrarMensagem("Senha alterada com sucesso!");
      senhaTrocada();
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) setErros({ senhaAtual: e.message });
      else mostrarMensagem(e instanceof Error ? e.message : "Erro ao trocar a senha.", "erro");
    } finally {
      setCarregando(false);
    }
  }

  return {
    senhaAtual,
    setSenhaAtual,
    novaSenha,
    setNovaSenha,
    confirmacao,
    setConfirmacao,
    carregando,
    erros,
    onSalvar,
    sair,
  };
}
