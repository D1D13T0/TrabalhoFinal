import { useAuth } from "@/contexts/AuthContext";
import { useMensagem } from "@/contexts/MensagemContext";
import { criarExecucaoDAO } from "@/database/ExecucaoDAO";
import { criarTreinoLocalDAO, type TreinoItemLocal, type TreinoLocal } from "@/database/TreinoLocalDAO";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";

function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ViewModel da execução do treino: lê a ficha do SQLite local e grava os exercícios marcados como feitos.
// Funciona 100% offline.
export function useExecucaoTreinoViewModel(treinoId: number) {
  const db = useSQLiteContext();
  const { usuario } = useAuth();
  const { mostrarMensagem } = useMensagem();
  const daos = useMemo(() => ({ treinos: criarTreinoLocalDAO(db), execucoes: criarExecucaoDAO(db) }), [db]);
  const [treino, setTreino] = useState<(TreinoLocal & { itens: TreinoItemLocal[] }) | null>(null);
  const [concluidos, setConcluidos] = useState<Set<number>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [confirmarReinicio, setConfirmarReinicio] = useState(false);
  const data = hoje();

  const carregar = useCallback(async () => {
    const [t, feitos] = await Promise.all([
      daos.treinos.buscar(treinoId, usuario?.alunoId ?? 0),
      daos.execucoes.concluidosNoDia(treinoId, data),
    ]);
    setTreino(t);
    setConcluidos(feitos);
    setCarregando(false);
  }, [daos, treinoId, usuario?.alunoId, data]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function alternar(item: TreinoItemLocal) {
    const marcado = concluidos.has(item.id);
    const novo = new Set(concluidos);
    if (marcado) {
      await daos.execucoes.desmarcar(item.id, data);
      novo.delete(item.id);
    } else {
      await daos.execucoes.marcar(item.id, data);
      novo.add(item.id);
    }
    setConcluidos(novo);
    if (!marcado && treino && novo.size === treino.itens.length) {
      mostrarMensagem("Treino concluído! Mandou bem! 💪");
    }
  }

  async function reiniciar() {
    await daos.execucoes.limparDia(treinoId, data);
    setConcluidos(new Set());
    setConfirmarReinicio(false);
    mostrarMensagem("Marcações de hoje apagadas.", "info");
  }

  const total = treino?.itens.length ?? 0;

  return {
    treino,
    carregando,
    concluidos,
    alternar,
    progresso: total ? concluidos.size / total : 0,
    feitos: concluidos.size,
    total,
    confirmarReinicio,
    pedirReinicio: () => setConfirmarReinicio(true),
    cancelarReinicio: () => setConfirmarReinicio(false),
    reiniciar,
  };
}
