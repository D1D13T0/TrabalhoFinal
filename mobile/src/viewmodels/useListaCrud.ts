import { useMensagem } from "@/contexts/MensagemContext";
import { normalizar } from "@/utils/formatacao";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";

export type FiltroSituacao = "ativos" | "inativos" | "todos";

interface Opcoes<T> {
  carregar: () => Promise<T[]>;
  excluir: (item: T) => Promise<void>;
  textoBusca: (item: T) => (string | null | undefined)[]; // campos pesquisáveis
  ativo: (item: T) => boolean;
  nome: (item: T) => string;
  filtroExtra?: (item: T) => boolean;
}

// Lógica comum das telas de listagem: carregar, buscar em tempo real, filtrar e excluir com confirmação.
export function useListaCrud<T extends { id: number }>(opcoes: Opcoes<T>) {
  const { carregar, excluir, textoBusca, ativo, nome, filtroExtra } = opcoes;
  const { mostrarMensagem } = useMensagem();
  const carregarRef = useRef(carregar);
  carregarRef.current = carregar;
  const [itens, setItens] = useState<T[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<FiltroSituacao>("ativos");
  const [paraExcluir, setParaExcluir] = useState<T | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const recarregar = useCallback(async () => {
    try {
      setItens(await carregarRef.current());
    } catch (e) {
      mostrarMensagem(e instanceof Error ? e.message : "Erro ao carregar.", "erro");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [mostrarMensagem]);

  // Recarrega sempre que a tela volta a ficar visível (ex.: depois de salvar no formulário).
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return itens.filter((item) => {
      if (situacao === "ativos" && !ativo(item)) return false;
      if (situacao === "inativos" && ativo(item)) return false;
      if (filtroExtra && !filtroExtra(item)) return false;
      if (!termo) return true;
      return textoBusca(item).some((campo) => campo && normalizar(campo).includes(termo));
    });
  }, [itens, busca, situacao, ativo, textoBusca, filtroExtra]);

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await excluir(paraExcluir);
      setItens((lista) => lista.filter((i) => i.id !== paraExcluir.id));
      mostrarMensagem(`"${nome(paraExcluir)}" foi excluído.`);
      setParaExcluir(null);
    } catch (e) {
      mostrarMensagem(e instanceof Error ? e.message : "Erro ao excluir.", "erro");
      setParaExcluir(null);
    } finally {
      setExcluindo(false);
    }
  }

  return {
    filtrados,
    total: itens.length,
    carregando,
    atualizando,
    atualizar: () => {
      setAtualizando(true);
      recarregar();
    },
    busca,
    setBusca,
    situacao,
    setSituacao,
    paraExcluir,
    pedirExclusao: setParaExcluir,
    cancelarExclusao: () => setParaExcluir(null),
    confirmarExclusao,
    excluindo,
  };
}
