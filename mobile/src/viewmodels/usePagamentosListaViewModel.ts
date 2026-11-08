import { useMensagem } from "@/contexts/MensagemContext";
import type { Pagamento } from "@/models";
import { pagamentoService } from "@/services/pagamentoService";
import { mesAtual, normalizar } from "@/utils/formatacao";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

export type FiltroPago = "todos" | "pagos" | "pendentes";

// ViewModel da lista de pagamentos: filtra por mês, situação e nome do aluno (em tempo real).
export function usePagamentosListaViewModel() {
  const { mostrarMensagem } = useMensagem();
  const [mes, setMes] = useState(mesAtual());
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroPago, setFiltroPago] = useState<FiltroPago>("todos");
  const [paraExcluir, setParaExcluir] = useState<Pagamento | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setPagamentos(await pagamentoService.listar({ mes }));
    } catch (e) {
      mostrarMensagem(e instanceof Error ? e.message : "Erro ao carregar pagamentos.", "erro");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [mes, mostrarMensagem]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return pagamentos.filter((p) => {
      if (filtroPago === "pagos" && !p.pago) return false;
      if (filtroPago === "pendentes" && p.pago) return false;
      return !termo || normalizar(p.aluno.usuario.nome).includes(termo);
    });
  }, [pagamentos, busca, filtroPago]);

  const totais = useMemo(
    () => ({
      recebido: pagamentos.filter((p) => p.pago).reduce((s, p) => s + p.valor, 0),
      pendente: pagamentos.filter((p) => !p.pago).reduce((s, p) => s + p.valor, 0),
    }),
    [pagamentos],
  );

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    try {
      await pagamentoService.excluir(paraExcluir.id);
      setPagamentos((lista) => lista.filter((p) => p.id !== paraExcluir.id));
      mostrarMensagem("Pagamento excluído.");
      setParaExcluir(null);
    } catch (e) {
      mostrarMensagem(e instanceof Error ? e.message : "Erro ao excluir.", "erro");
    } finally {
      setExcluindo(false);
    }
  }

  return {
    mes,
    setMes: (m: string) => {
      setCarregando(true);
      setMes(m);
    },
    filtrados,
    total: pagamentos.length,
    totais,
    carregando,
    atualizando,
    atualizar: () => {
      setAtualizando(true);
      carregar();
    },
    busca,
    setBusca,
    filtroPago,
    setFiltroPago,
    paraExcluir,
    pedirExclusao: setParaExcluir,
    cancelarExclusao: () => setParaExcluir(null),
    confirmarExclusao,
    excluindo,
  };
}
