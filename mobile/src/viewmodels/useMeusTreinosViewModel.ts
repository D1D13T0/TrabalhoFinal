import { useAuth } from "@/contexts/AuthContext";
import { criarExecucaoDAO } from "@/database/ExecucaoDAO";
import { criarPreferenciaDAO } from "@/database/PreferenciaDAO";
import { criarTreinoLocalDAO, type TreinoLocal } from "@/database/TreinoLocalDAO";
import type { Mensalidade } from "@/models";
import { alunoAreaService } from "@/services/alunoAreaService";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";

export const CHAVE_ULTIMA_SINCRONIZACAO = "ultimaSincronizacao";
export const CHAVE_MENSALIDADE = "mensalidade";

function dataLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ViewModel de "Meus treinos": mostra a cópia local na hora e sincroniza com o servidor em seguida.
// Sem internet, continua mostrando o que está salvo no SQLite do celular.
export function useMeusTreinosViewModel() {
  const db = useSQLiteContext();
  const { usuario } = useAuth();
  const alunoId = usuario?.alunoId ?? 0;
  const daos = useMemo(
    () => ({ treinos: criarTreinoLocalDAO(db), execucoes: criarExecucaoDAO(db), prefs: criarPreferenciaDAO(db) }),
    [db],
  );

  const [treinos, setTreinos] = useState<TreinoLocal[]>([]);
  const [mensalidade, setMensalidade] = useState<Mensalidade | null>(null);
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [diasNaSemana, setDiasNaSemana] = useState(0);

  const lerLocal = useCallback(async () => {
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);
    const [lista, mens, sinc, dias] = await Promise.all([
      daos.treinos.listar(alunoId),
      daos.prefs.ler<Mensalidade>(`${CHAVE_MENSALIDADE}:${alunoId}`),
      daos.prefs.ler<string>(`${CHAVE_ULTIMA_SINCRONIZACAO}:${alunoId}`),
      daos.execucoes.diasAtivosNaSemana(dataLocal(seteDiasAtras)),
    ]);
    setTreinos(lista);
    setMensalidade(mens);
    setUltimaSincronizacao(sinc);
    setDiasNaSemana(dias);
  }, [daos, alunoId]);

  const sincronizar = useCallback(async () => {
    try {
      const [doServidor, mens] = await Promise.all([alunoAreaService.treinos(), alunoAreaService.mensalidade()]);
      await daos.treinos.substituirTodos(alunoId, doServidor);
      await daos.prefs.salvar(`${CHAVE_MENSALIDADE}:${alunoId}`, mens);
      await daos.prefs.salvar(`${CHAVE_ULTIMA_SINCRONIZACAO}:${alunoId}`, new Date().toISOString());
      setOffline(false);
    } catch {
      setOffline(true); // sem conexão: segue com a cópia local
    }
    await lerLocal();
  }, [daos, alunoId, lerLocal]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await lerLocal(); // mostra o que já está no celular imediatamente
        setCarregando(false);
        await sincronizar();
      })();
    }, [lerLocal, sincronizar]),
  );

  return {
    treinos,
    mensalidade,
    ultimaSincronizacao,
    offline,
    carregando,
    atualizando,
    diasNaSemana,
    atualizar: async () => {
      setAtualizando(true);
      await sincronizar();
      setAtualizando(false);
    },
  };
}
