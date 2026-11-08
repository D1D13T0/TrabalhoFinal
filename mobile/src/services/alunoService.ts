import type { Aluno, DiaSemana, Sexo } from "@/models";
import { Platform } from "react-native";
import { api } from "./api";

export interface AlunoPayload {
  nome: string;
  email: string;
  planoId: number;
  telefone: string;
  dataNascimento: string; // AAAA-MM-DD
  sexo: Sexo;
  diaVencimento: number;
  diasTreino: DiaSemana[];
  possuiRestricaoMedica: boolean;
  observacoes: string | null;
  ativo: boolean;
  senhaInicial?: string;
}

export interface ImagemSelecionada {
  uri: string;
  nome: string;
  tipo: string;
}

// Monta o FormData da imagem: no celular usa a URI do arquivo; na web, um Blob.
export async function montarFormDataImagem(imagem: ImagemSelecionada): Promise<FormData> {
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await (await fetch(imagem.uri)).blob();
    form.append("imagem", blob, imagem.nome);
  } else {
    form.append("imagem", { uri: imagem.uri, name: imagem.nome, type: imagem.tipo } as unknown as Blob);
  }
  return form;
}

export const alunoService = {
  listar: () => api.get<Aluno[]>("/alunos"),
  buscar: (id: number) => api.get<Aluno>(`/alunos/${id}`),
  criar: (dados: AlunoPayload) => api.post<Aluno>("/alunos", dados),
  atualizar: (id: number, dados: AlunoPayload) => api.put<Aluno>(`/alunos/${id}`, dados),
  excluir: (id: number) => api.delete(`/alunos/${id}`),
  async enviarFoto(id: number, imagem: ImagemSelecionada) {
    return api.post<Aluno>(`/alunos/${id}/foto`, await montarFormDataImagem(imagem));
  },
};
