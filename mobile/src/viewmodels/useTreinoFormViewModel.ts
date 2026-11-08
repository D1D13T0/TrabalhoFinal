import { useMensagem } from "@/contexts/MensagemContext";
import type { Aluno, Exercicio } from "@/models";
import { alunoService } from "@/services/alunoService";
import { ApiError } from "@/services/api";
import { selecaoExercicio } from "@/services/selecaoExercicio";
import { treinoService } from "@/services/treinoService";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

// Um exercício dentro da ficha, com os campos ainda em texto (como digitados na tela).
export interface ItemForm {
  chave: string; // identificador local para a lista
  exercicio: Exercicio;
  series: string;
  repeticoes: string;
  carga: string;
  descanso: string;
}

type ErrosItem = Partial<Record<"series" | "repeticoes" | "carga" | "descanso", string>>;

interface Erros {
  aluno?: string;
  nome?: string;
  itens?: string;
  porItem: Record<string, ErrosItem>;
}

let contador = 0;
const novaChave = () => `item-${Date.now()}-${contador++}`;

const numeroOuNulo = (t: string) => (t.trim() === "" ? null : Number(t.replace(",", ".")));

// ViewModel da ficha de treino (novo ou edição).
export function useTreinoFormViewModel(treinoId?: number, alunoInicialId?: number) {
  const editando = treinoId !== undefined;
  const { mostrarMensagem } = useMensagem();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoId, setAlunoId] = useState<number | null>(alunoInicialId ?? null);
  const [nome, setNome] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [itens, setItens] = useState<ItemForm[]>([]);
  const [erros, setErros] = useState<Erros>({ porItem: {} });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [seletorAlunoAberto, setSeletorAlunoAberto] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const itensRef = useRef(itens);
  itensRef.current = itens;

  useEffect(() => {
    (async () => {
      try {
        const [listaAlunos, treino] = await Promise.all([
          alunoService.listar(),
          editando ? treinoService.buscar(treinoId) : Promise.resolve(null),
        ]);
        setAlunos(listaAlunos.filter((a) => a.ativo || a.id === treino?.alunoId));
        if (treino) {
          setAlunoId(treino.alunoId);
          setNome(treino.nome);
          setObservacoes(treino.observacoes ?? "");
          setAtivo(treino.ativo);
          setItens(
            treino.itens.map((i) => ({
              chave: novaChave(),
              exercicio: i.exercicio,
              series: String(i.series),
              repeticoes: i.repeticoes,
              carga: i.carga === null ? "" : String(i.carga).replace(".", ","),
              descanso: i.descansoSegundos === null ? "" : String(i.descansoSegundos),
            })),
          );
        }
      } catch (e) {
        mostrarMensagem(e instanceof Error ? e.message : "Erro ao carregar o treino.", "erro");
        router.back();
      } finally {
        setCarregando(false);
      }
    })();
  }, [editando, treinoId, mostrarMensagem]);

  const alunoSelecionado = useMemo(() => alunos.find((a) => a.id === alunoId) ?? null, [alunos, alunoId]);

  function adicionarExercicio() {
    selecaoExercicio.aguardar(
      (exercicio) => {
        setItens((lista) => [
          ...lista,
          { chave: novaChave(), exercicio, series: "3", repeticoes: "12", carga: "", descanso: "60" },
        ]);
        setErros((e) => ({ ...e, itens: undefined }));
      },
      itensRef.current.map((i) => i.exercicio.id),
    );
    router.push("/treino/selecionar-exercicio");
  }

  function alterarItem(chave: string, campo: "series" | "repeticoes" | "carga" | "descanso", valor: string) {
    const limpo =
      campo === "series" || campo === "descanso"
        ? valor.replace(/\D/g, "").slice(0, 3)
        : campo === "carga"
          ? valor.replace(/[^\d,]/g, "").slice(0, 6)
          : valor.slice(0, 20);
    setItens((lista) => lista.map((i) => (i.chave === chave ? { ...i, [campo]: limpo } : i)));
    setErros((e) => ({ ...e, porItem: { ...e.porItem, [chave]: { ...e.porItem[chave], [campo]: undefined } } }));
  }

  function moverItem(chave: string, direcao: -1 | 1) {
    setItens((lista) => {
      const i = lista.findIndex((x) => x.chave === chave);
      const j = i + direcao;
      if (i < 0 || j < 0 || j >= lista.length) return lista;
      const nova = [...lista];
      [nova[i], nova[j]] = [nova[j], nova[i]];
      return nova;
    });
  }

  function removerItem(chave: string) {
    setItens((lista) => lista.filter((i) => i.chave !== chave));
  }

  function validar() {
    const novos: Erros = { porItem: {} };
    if (!alunoId) novos.aluno = "Selecione o aluno.";
    if (nome.trim().length < 2) novos.nome = "Dê um nome ao treino (ex.: Treino A - Peito e Tríceps).";
    if (itens.length === 0) novos.itens = "Adicione ao menos um exercício.";
    for (const item of itens) {
      const e: ErrosItem = {};
      const series = Number(item.series);
      if (!Number.isInteger(series) || series < 1 || series > 20) e.series = "1 a 20";
      if (!item.repeticoes.trim()) e.repeticoes = "Obrigatório";
      const carga = numeroOuNulo(item.carga);
      if (carga !== null && (Number.isNaN(carga) || carga < 0)) e.carga = "Inválida";
      if (Object.keys(e).length) novos.porItem[item.chave] = e;
    }
    setErros(novos);
    return !novos.aluno && !novos.nome && !novos.itens && Object.keys(novos.porItem).length === 0;
  }

  async function salvar() {
    if (!validar()) {
      mostrarMensagem("Corrija os campos destacados.", "erro");
      return;
    }
    setSalvando(true);
    try {
      const dados = {
        alunoId: alunoId!,
        nome: nome.trim(),
        observacoes: observacoes.trim() || null,
        ativo,
        itens: itens.map((i) => ({
          exercicioId: i.exercicio.id,
          series: Number(i.series),
          repeticoes: i.repeticoes.trim(),
          carga: numeroOuNulo(i.carga),
          descansoSegundos: numeroOuNulo(i.descanso),
        })),
      };
      if (editando) await treinoService.atualizar(treinoId, dados);
      else await treinoService.criar(dados);
      mostrarMensagem(editando ? "Treino atualizado!" : "Treino criado!");
      router.back();
    } catch (e) {
      mostrarMensagem(e instanceof ApiError || e instanceof Error ? e.message : "Erro ao salvar.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!editando) return;
    setExcluindo(true);
    try {
      await treinoService.excluir(treinoId);
      setConfirmarExclusao(false);
      mostrarMensagem("Treino excluído.");
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
    escolherAluno: (id: number) => {
      setAlunoId(id);
      setSeletorAlunoAberto(false);
      setErros((e) => ({ ...e, aluno: undefined }));
    },
    seletorAlunoAberto,
    abrirSeletorAluno: () => setSeletorAlunoAberto(true),
    fecharSeletorAluno: () => setSeletorAlunoAberto(false),
    nome,
    alterarNome: (t: string) => {
      setNome(t);
      setErros((e) => ({ ...e, nome: undefined }));
    },
    observacoes,
    setObservacoes,
    ativo,
    alternarAtivo: () => setAtivo((a) => !a),
    itens,
    adicionarExercicio,
    alterarItem,
    moverItem,
    removerItem,
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
