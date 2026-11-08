import { useMensagem } from "@/contexts/MensagemContext";
import type { Exercicio } from "@/models";
import { ApiError } from "@/services/api";
import { exercicioService, rotuloGrupo } from "@/services/exercicioService";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useEscolherImagem } from "./useEscolherImagem";
import { useListaCrud } from "./useListaCrud";

// ViewModel da lista de exercícios (com filtro por grupo muscular).
export function useExerciciosListaViewModel() {
  const [grupo, setGrupo] = useState<string | null>(null);
  const filtroGrupo = useCallback((e: Exercicio) => !grupo || e.grupoMuscular === grupo, [grupo]);

  const lista = useListaCrud<Exercicio>({
    carregar: exercicioService.listar,
    excluir: (e) => exercicioService.excluir(e.id),
    textoBusca: (e) => [e.nome, rotuloGrupo(e.grupoMuscular), e.descricao],
    ativo: (e) => e.ativo,
    nome: (e) => e.nome,
    filtroExtra: filtroGrupo,
  });

  return { ...lista, grupo, alternarGrupo: (g: string) => setGrupo((atual) => (atual === g ? null : g)) };
}

type Campo = "nome" | "grupoMuscular";

// ViewModel do cadastro/edição de exercício. exercicioId = undefined para novo.
export function useExercicioFormViewModel(exercicioId?: number) {
  const editando = exercicioId !== undefined;
  const { mostrarMensagem } = useMensagem();
  const [nome, setNome] = useState("");
  const [grupoMuscular, setGrupoMuscular] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [imagemAtual, setImagemAtual] = useState<string | null>(null);
  const { imagem: novaImagem, escolher: escolherImagem } = useEscolherImagem([4, 3]);
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    exercicioService
      .buscar(exercicioId)
      .then((e) => {
        setNome(e.nome);
        setGrupoMuscular(e.grupoMuscular);
        setDescricao(e.descricao ?? "");
        setAtivo(e.ativo);
        setImagemAtual(e.imagem);
      })
      .catch((e) => {
        mostrarMensagem(e instanceof Error ? e.message : "Erro ao carregar exercício.", "erro");
        router.back();
      })
      .finally(() => setCarregando(false));
  }, [editando, exercicioId, mostrarMensagem]);

  async function salvar() {
    const e: Partial<Record<Campo, string>> = {};
    if (nome.trim().length < 2) e.nome = "Informe o nome do exercício.";
    if (!grupoMuscular) e.grupoMuscular = "Escolha o grupo muscular.";
    setErros(e);
    if (Object.keys(e).length) {
      mostrarMensagem("Corrija os campos destacados.", "erro");
      return;
    }

    setSalvando(true);
    try {
      const dados = { nome: nome.trim(), grupoMuscular, descricao: descricao.trim() || null, ativo };
      const exercicio = editando
        ? await exercicioService.atualizar(exercicioId, dados)
        : await exercicioService.criar(dados);
      if (novaImagem) {
        try {
          await exercicioService.enviarImagem(exercicio.id, novaImagem);
        } catch {
          mostrarMensagem("Exercício salvo, mas a imagem não pôde ser enviada.", "erro");
          router.back();
          return;
        }
      }
      mostrarMensagem(editando ? "Exercício atualizado!" : "Exercício cadastrado!");
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
      setErros((x) => ({ ...x, nome: undefined }));
    },
    grupoMuscular,
    escolherGrupo: (g: string) => {
      setGrupoMuscular(g);
      setErros((x) => ({ ...x, grupoMuscular: undefined }));
    },
    descricao,
    setDescricao,
    ativo,
    alternarAtivo: () => setAtivo((a) => !a),
    imagemAtual,
    novaImagem,
    escolherImagem,
    erros,
    carregando,
    salvando,
    salvar,
  };
}
