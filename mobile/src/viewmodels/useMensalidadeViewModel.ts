import { useAuth } from "@/contexts/AuthContext";
import { criarPreferenciaDAO } from "@/database/PreferenciaDAO";
import type { Mensalidade, Pagamento } from "@/models";
import { alunoAreaService } from "@/services/alunoAreaService";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import { CHAVE_MENSALIDADE } from "./useMeusTreinosViewModel";

const CHAVE_PAGAMENTOS = "pagamentos";

// ViewModel da aba Mensalidade: situação do mês e histórico de pagamentos (com cópia local).
export function useMensalidadeViewModel() {
  const db = useSQLiteContext();
  const prefs = useMemo(() => criarPreferenciaDAO(db), [db]);
  const { usuario } = useAuth();
  const alunoId = usuario?.alunoId ?? 0;
  const [mensalidade, setMensalidade] = useState<Mensalidade | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [offline, setOffline] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [m, p] = await Promise.all([alunoAreaService.mensalidade(), alunoAreaService.pagamentos()]);
      setMensalidade(m);
      setPagamentos(p);
      setOffline(false);
      await prefs.salvar(`${CHAVE_MENSALIDADE}:${alunoId}`, m);
      await prefs.salvar(`${CHAVE_PAGAMENTOS}:${alunoId}`, p);
    } catch {
      setOffline(true);
      setMensalidade(await prefs.ler<Mensalidade>(`${CHAVE_MENSALIDADE}:${alunoId}`));
      setPagamentos((await prefs.ler<Pagamento[]>(`${CHAVE_PAGAMENTOS}:${alunoId}`)) ?? []);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [prefs, alunoId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  return {
    mensalidade,
    pagamentos,
    carregando,
    atualizando,
    offline,
    atualizar: () => {
      setAtualizando(true);
      carregar();
    },
  };
}
