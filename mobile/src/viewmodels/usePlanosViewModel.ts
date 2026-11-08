import { useMensagem } from "@/contexts/MensagemContext";
import type { Plano } from "@/models";
import { ApiError } from "@/services/api";
import { planoService } from "@/services/planoService";
import { mascaraMoeda, moedaParaNumero, numeroParaMoeda } from "@/utils/formatacao";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useListaCrud } from "./useListaCrud";

// ViewModel da lista de planos.
export function usePlanosListaViewModel() {
  return useListaCrud<Plano>({
    carregar: () => planoService.listar(),
    excluir: (p) => planoService.excluir(p.id),
    textoBusca: (p) => [p.nome, String(p.diasPorSemana)],
    ativo: (p) => p.ativo,
    nome: (p) => p.nome,
  });
}

type Campo = "nome" | "diasPorSemana" | "valor";

// ViewModel do cadastro/edição de plano. planoId = undefined para novo plano.
export function usePlanoFormViewModel(planoId?: number) {
  const editando = planoId !== undefined;
  const { mostrarMensagem } = useMensagem();
  const [nome, setNome] = useState("");
  const [diasPorSemana, setDiasPorSemana] = useState<number | null>(null);
  const [valor, setValor] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [nomeEditado, setNomeEditado] = useState(false);
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    planoService
      .buscar(planoId)
      .then((p) => {
        setNome(p.nome);
        setDiasPorSemana(p.diasPorSemana);
        setValor(numeroParaMoeda(p.valor));
        setAtivo(p.ativo);
        setNomeEditado(true);
      })
      .catch((e) => {
        mostrarMensagem(e instanceof Error ? e.message : "Erro ao carregar plano.", "erro");
        router.back();
      })
      .finally(() => setCarregando(false));
  }, [editando, planoId, mostrarMensagem]);

  function limparErro(campo: Campo) {
    setErros((e) => ({ ...e, [campo]: undefined }));
  }

  // Sugere o nome "3x por semana" enquanto o usuário não digitar um nome próprio.
  function escolherDias(dias: number) {
    setDiasPorSemana(dias);
    limparErro("diasPorSemana");
    if (!nomeEditado) {
      setNome(`${dias}x por semana`);
      limparErro("nome");
    }
  }

  async function salvar() {
    const e: Partial<Record<Campo, string>> = {};
    const valorNumero = moedaParaNumero(valor);
    if (nome.trim().length < 2) e.nome = "Informe o nome do plano.";
    if (!diasPorSemana) e.diasPorSemana = "Escolha quantos dias por semana.";
    if (valorNumero <= 0) e.valor = "Informe um valor maior que zero.";
    setErros(e);
    if (Object.keys(e).length) {
      mostrarMensagem("Corrija os campos destacados.", "erro");
      return;
    }

    setSalvando(true);
    try {
      const dados = { nome: nome.trim(), diasPorSemana: diasPorSemana!, valor: valorNumero, ativo };
      if (editando) await planoService.atualizar(planoId, dados);
      else await planoService.criar(dados);
      mostrarMensagem(editando ? "Plano atualizado!" : "Plano cadastrado!");
      router.back();
    } catch (err) {
      if (err instanceof ApiError && err.detalhes.length) {
        setErros(Object.fromEntries(err.detalhes.map((d) => [d.campo, d.mensagem])));
      }
      mostrarMensagem(err instanceof Error ? err.message : "Erro ao salvar.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  return {
    editando,
    nome,
    alterarNome: (t: string) => {
      setNome(t);
      setNomeEditado(true);
      limparErro("nome");
    },
    diasPorSemana,
    escolherDias,
    valor,
    alterarValor: (t: string) => {
      setValor(mascaraMoeda(t));
      limparErro("valor");
    },
    ativo,
    alternarAtivo: () => setAtivo((a) => !a),
    erros,
    carregando,
    salvando,
    salvar,
  };
}
