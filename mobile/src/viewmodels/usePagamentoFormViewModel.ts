import { useMensagem } from "@/contexts/MensagemContext";
import type { Aluno, FormaPagamento } from "@/models";
import { alunoService } from "@/services/alunoService";
import { ApiError } from "@/services/api";
import { pagamentoService } from "@/services/pagamentoService";
import {
  brParaIso,
  hojeBr,
  isoParaBr,
  mascaraData,
  mascaraMoeda,
  mesAtual,
  moedaParaNumero,
  numeroParaMoeda,
} from "@/utils/formatacao";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

type Campo = "aluno" | "valor" | "dataPagamento" | "mesReferencia";

interface Iniciais {
  pagamentoId?: number;
  alunoId?: number;
  mes?: string;
}

// ViewModel do registro/edição de pagamento.
export function usePagamentoFormViewModel({ pagamentoId, alunoId: alunoInicial, mes }: Iniciais) {
  const editando = pagamentoId !== undefined;
  const { mostrarMensagem } = useMensagem();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoId, setAlunoId] = useState<number | null>(alunoInicial ?? null);
  const [mesReferencia, setMesReferencia] = useState(mes ?? mesAtual());
  const [valor, setValor] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("PIX");
  const [pago, setPago] = useState(true);
  const [dataPagamento, setDataPagamento] = useState(hojeBr());
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [seletorAberto, setSeletorAberto] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [lista, pagamento] = await Promise.all([
          alunoService.listar(),
          editando ? pagamentoService.buscar(pagamentoId) : Promise.resolve(null),
        ]);
        setAlunos(lista.filter((a) => a.ativo || a.id === pagamento?.alunoId));
        if (pagamento) {
          setAlunoId(pagamento.alunoId);
          setMesReferencia(pagamento.mesReferencia);
          setValor(numeroParaMoeda(pagamento.valor));
          setFormaPagamento(pagamento.formaPagamento);
          setPago(pagamento.pago);
          setDataPagamento(pagamento.dataPagamento ? isoParaBr(pagamento.dataPagamento) : hojeBr());
        } else if (alunoInicial) {
          // Novo pagamento vindo de um aluno: já sugere o valor do plano dele.
          const aluno = lista.find((a) => a.id === alunoInicial);
          if (aluno) setValor(numeroParaMoeda(aluno.plano.valor));
        }
      } catch (e) {
        mostrarMensagem(e instanceof Error ? e.message : "Erro ao carregar dados.", "erro");
        router.back();
      } finally {
        setCarregando(false);
      }
    })();
  }, [editando, pagamentoId, alunoInicial, mostrarMensagem]);

  const alunoSelecionado = useMemo(() => alunos.find((a) => a.id === alunoId) ?? null, [alunos, alunoId]);

  function limpar(campo: Campo) {
    setErros((e) => ({ ...e, [campo]: undefined }));
  }

  function escolherAluno(id: number) {
    setAlunoId(id);
    setSeletorAberto(false);
    limpar("aluno");
    const aluno = alunos.find((a) => a.id === id);
    if (aluno && !editando) {
      setValor(numeroParaMoeda(aluno.plano.valor));
      limpar("valor");
    }
  }

  async function salvar() {
    const e: Partial<Record<Campo, string>> = {};
    const valorNumero = moedaParaNumero(valor);
    const dataIso = pago ? brParaIso(dataPagamento) : null;
    if (!alunoId) e.aluno = "Selecione o aluno.";
    if (valorNumero <= 0) e.valor = "Informe um valor maior que zero.";
    if (pago && !dataIso) e.dataPagamento = "Data inválida (DD/MM/AAAA).";
    setErros(e);
    if (Object.keys(e).length) {
      mostrarMensagem("Corrija os campos destacados.", "erro");
      return;
    }

    setSalvando(true);
    try {
      const dados = { alunoId: alunoId!, mesReferencia, valor: valorNumero, formaPagamento, pago, dataPagamento: dataIso };
      if (editando) await pagamentoService.atualizar(pagamentoId, dados);
      else await pagamentoService.criar(dados);
      mostrarMensagem(editando ? "Pagamento atualizado!" : "Pagamento registrado!");
      router.back();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErros({ mesReferencia: "Já existe um pagamento deste aluno nesse mês. Edite o existente." });
      }
      mostrarMensagem(err instanceof Error ? err.message : "Erro ao salvar.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!editando) return;
    setExcluindo(true);
    try {
      await pagamentoService.excluir(pagamentoId);
      setConfirmarExclusao(false);
      mostrarMensagem("Pagamento excluído.");
      router.back();
    } catch (e) {
      mostrarMensagem(e instanceof Error ? e.message : "Erro ao excluir.", "erro");
    } finally {
      setExcluindo(false);
    }
  }

  return {
    editando,
    alunos,
    alunoSelecionado,
    escolherAluno,
    seletorAberto,
    abrirSeletor: () => setSeletorAberto(true),
    fecharSeletor: () => setSeletorAberto(false),
    mesReferencia,
    mudarMes: (m: string) => {
      setMesReferencia(m);
      limpar("mesReferencia");
    },
    valor,
    alterarValor: (t: string) => {
      setValor(mascaraMoeda(t));
      limpar("valor");
    },
    formaPagamento,
    setFormaPagamento,
    pago,
    alternarPago: () => setPago((p) => !p),
    dataPagamento,
    alterarData: (t: string) => {
      setDataPagamento(mascaraData(t));
      limpar("dataPagamento");
    },
    erros,
    carregando,
    salvando,
    salvar,
    confirmarExclusao,
    pedirExclusao: () => setConfirmarExclusao(true),
    cancelarExclusao: () => setConfirmarExclusao(false),
    excluir,
    excluindo,
  };
}
