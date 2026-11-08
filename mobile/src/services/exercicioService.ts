import type { Exercicio } from "@/models";
import { montarFormDataImagem, type ImagemSelecionada } from "./alunoService";
import { api } from "./api";

export interface ExercicioPayload {
  nome: string;
  grupoMuscular: string;
  descricao: string | null;
  ativo: boolean;
}

export const GRUPOS_MUSCULARES: { valor: string; rotulo: string }[] = [
  { valor: "PEITO", rotulo: "Peito" },
  { valor: "COSTAS", rotulo: "Costas" },
  { valor: "PERNAS", rotulo: "Pernas" },
  { valor: "OMBROS", rotulo: "Ombros" },
  { valor: "BICEPS", rotulo: "Bíceps" },
  { valor: "TRICEPS", rotulo: "Tríceps" },
  { valor: "ABDOMEN", rotulo: "Abdômen" },
  { valor: "GLUTEOS", rotulo: "Glúteos" },
  { valor: "CARDIO", rotulo: "Cardio" },
];

export function rotuloGrupo(valor: string): string {
  return GRUPOS_MUSCULARES.find((g) => g.valor === valor)?.rotulo ?? valor;
}

export const exercicioService = {
  listar: () => api.get<Exercicio[]>("/exercicios"),
  buscar: (id: number) => api.get<Exercicio>(`/exercicios/${id}`),
  criar: (dados: ExercicioPayload) => api.post<Exercicio>("/exercicios", dados),
  atualizar: (id: number, dados: ExercicioPayload) => api.put<Exercicio>(`/exercicios/${id}`, dados),
  excluir: (id: number) => api.delete(`/exercicios/${id}`),
  async enviarImagem(id: number, imagem: ImagemSelecionada) {
    return api.post<Exercicio>(`/exercicios/${id}/imagem`, await montarFormDataImagem(imagem));
  },
};
