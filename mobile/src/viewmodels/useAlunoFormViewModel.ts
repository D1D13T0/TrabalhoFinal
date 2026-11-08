import { useMensagem } from "@/contexts/MensagemContext";
import type { DiaSemana, Plano, Sexo } from "@/models";
import { alunoService, type AlunoPayload } from "@/services/alunoService";
import { ApiError } from "@/services/api";
import { planoService } from "@/services/planoService";
import { brParaIso, isoParaBr, mascaraData, mascaraTelefone } from "@/utils/formatacao";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useEscolherImagem } from "./useEscolherImagem";

type Campo =
  | "nome"
  | "email"
  | "telefone"
  | "dataNascimento"
  | "sexo"
  | "planoId"
  | "diasTreino"
  | "diaVencimento"
  | "senhaInicial"
  | "observacoes";

export interface FormAluno {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string; // DD/MM/AAAA na tela
  sexo: Sexo | "";
  planoId: number | null;
  diasTreino: DiaSemana[];
  diaVencimento: string;
  senhaInicial: string;
  possuiRestricaoMedica: boolean;
  observacoes: string;
  ativo: boolean;
}

const formVazio: FormAluno = {
  nome: "",
  email: "",
  telefone: "",
  dataNascimento: "",
  sexo: "",
  planoId: null,
  diasTreino: [],
  diaVencimento: "10",
  senhaInicial: "",
  possuiRestricaoMedica: false,
  observacoes: "",
  ativo: true,
};

// ViewModel do cadastro/edição de aluno. alunoId = undefined para novo aluno.
export function useAlunoFormViewModel(alunoId?: number) {
  const editando = alunoId !== undefined;
  const { mostrarMensagem } = useMensagem();
  const [form, setForm] = useState<FormAluno>(formVazio);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [fotoAtual, setFotoAtual] = useState<string | null>(null);
  const { imagem: novaFoto, escolher: escolherFoto } = useEscolherImagem();
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [listaPlanos, aluno] = await Promise.all([
          planoService.listar(),
          editando ? alunoService.buscar(alunoId) : Promise.resolve(null),
        ]);
        // Mostra os planos ativos + o plano atual do aluno (mesmo se foi desativado).
        setPlanos(listaPlanos.filter((p) => p.ativo || p.id === aluno?.planoId));
        if (aluno) {
          setFotoAtual(aluno.foto);
          setForm({
            nome: aluno.usuario.nome,
            email: aluno.usuario.email,
            telefone: aluno.telefone,
            dataNascimento: isoParaBr(aluno.dataNascimento),
            sexo: aluno.sexo,
            planoId: aluno.planoId,
            diasTreino: aluno.diasTreino,
            diaVencimento: String(aluno.diaVencimento),
            senhaInicial: "",
            possuiRestricaoMedica: aluno.possuiRestricaoMedica,
            observacoes: aluno.observacoes ?? "",
            ativo: aluno.ativo,
          });
        }
      } catch (e) {
        mostrarMensagem(e instanceof Error ? e.message : "Erro ao carregar dados.", "erro");
        router.back();
      } finally {
        setCarregando(false);
      }
    })();
  }, [alunoId, editando, mostrarMensagem]);

  const planoSelecionado = useMemo(() => planos.find((p) => p.id === form.planoId) ?? null, [planos, form.planoId]);

  function alterar<K extends keyof FormAluno>(campo: K, valor: FormAluno[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  }

  function alternarDia(dia: DiaSemana) {
    const marcado = form.diasTreino.includes(dia);
    alterar("diasTreino", marcado ? form.diasTreino.filter((d) => d !== dia) : [...form.diasTreino, dia]);
  }

  function validar(): AlunoPayload | null {
    const e: Partial<Record<Campo, string>> = {};
    const dataIso = brParaIso(form.dataNascimento);
    const diaVenc = Number(form.diaVencimento);

    if (form.nome.trim().length < 3) e.nome = "Informe o nome completo.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Informe um e-mail válido.";
    if (form.telefone.replace(/\D/g, "").length < 10) e.telefone = "Telefone incompleto.";
    if (!dataIso) e.dataNascimento = "Data inválida (DD/MM/AAAA).";
    else if (dataIso > new Date().toISOString().slice(0, 10)) e.dataNascimento = "Data no futuro.";
    if (!form.sexo) e.sexo = "Selecione o sexo.";
    if (!planoSelecionado) e.planoId = "Selecione um plano.";
    else if (form.diasTreino.length !== planoSelecionado.diasPorSemana)
      e.diasTreino = `Marque exatamente ${planoSelecionado.diasPorSemana} dia(s) (plano ${planoSelecionado.nome}).`;
    if (!Number.isInteger(diaVenc) || diaVenc < 1 || diaVenc > 28) e.diaVencimento = "Use um dia entre 1 e 28.";
    if (!editando && form.senhaInicial.length < 6) e.senhaInicial = "Mínimo de 6 caracteres.";
    if (form.possuiRestricaoMedica && !form.observacoes.trim())
      e.observacoes = "Descreva a restrição médica.";

    setErros(e);
    if (Object.keys(e).length > 0) return null;

    return {
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      telefone: form.telefone,
      dataNascimento: dataIso!,
      sexo: form.sexo as Sexo,
      planoId: form.planoId!,
      diasTreino: form.diasTreino,
      diaVencimento: diaVenc,
      possuiRestricaoMedica: form.possuiRestricaoMedica,
      observacoes: form.observacoes.trim() || null,
      ativo: form.ativo,
      ...(editando ? {} : { senhaInicial: form.senhaInicial }),
    };
  }

  async function salvar() {
    const dados = validar();
    if (!dados) {
      mostrarMensagem("Corrija os campos destacados.", "erro");
      return;
    }
    setSalvando(true);
    try {
      const aluno = editando ? await alunoService.atualizar(alunoId, dados) : await alunoService.criar(dados);
      if (novaFoto) {
        try {
          await alunoService.enviarFoto(aluno.id, novaFoto);
        } catch {
          mostrarMensagem("Aluno salvo, mas a foto não pôde ser enviada.", "erro");
          router.back();
          return;
        }
      }
      mostrarMensagem(editando ? "Aluno atualizado!" : "Aluno cadastrado!");
      router.back();
    } catch (e) {
      if (e instanceof ApiError && e.detalhes.length) {
        setErros(Object.fromEntries(e.detalhes.map((d) => [d.campo, d.mensagem])));
      }
      if (e instanceof ApiError && e.status === 409) setErros((x) => ({ ...x, email: "E-mail já cadastrado." }));
      mostrarMensagem(e instanceof Error ? e.message : "Erro ao salvar.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!editando) return;
    setExcluindo(true);
    try {
      await alunoService.excluir(alunoId);
      setConfirmarExclusao(false);
      mostrarMensagem("Aluno excluído.");
      router.back();
    } catch (e) {
      mostrarMensagem(e instanceof Error ? e.message : "Erro ao excluir.", "erro");
    } finally {
      setExcluindo(false);
    }
  }

  return {
    editando,
    form,
    alterar,
    alterarTelefone: (t: string) => alterar("telefone", mascaraTelefone(t)),
    alterarData: (t: string) => alterar("dataNascimento", mascaraData(t)),
    alternarDia,
    planos,
    planoSelecionado,
    fotoAtual,
    novaFoto,
    escolherFoto,
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
