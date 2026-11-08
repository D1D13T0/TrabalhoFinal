import { useMensagem } from "@/contexts/MensagemContext";
import { pagamentoService, type Dashboard } from "@/services/pagamentoService";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

// ViewModel do painel inicial do admin.
export function useDashboardViewModel() {
  const { mostrarMensagem } = useMensagem();
  const [dados, setDados] = useState<Dashboard | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setDados(await pagamentoService.dashboard());
    } catch (e) {
      mostrarMensagem(e instanceof Error ? e.message : "Erro ao carregar o painel.", "erro");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [mostrarMensagem]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  return {
    dados,
    carregando,
    atualizando,
    atualizar: () => {
      setAtualizando(true);
      carregar();
    },
  };
}
