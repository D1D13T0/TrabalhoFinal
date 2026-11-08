import type { Treino } from "@/models";
import { api, montarQuery } from "./api";

export interface TreinoItemPayload {
  exercicioId: number;
  series: number;
  repeticoes: string;
  carga: number | null;
  descansoSegundos: number | null;
}

export interface TreinoPayload {
  alunoId: number;
  nome: string;
  observacoes: string | null;
  ativo: boolean;
  itens: TreinoItemPayload[]; // a ordem da lista é a ordem do treino
}

export const treinoService = {
  listar: (filtro: { alunoId?: number } = {}) => api.get<Treino[]>(`/treinos${montarQuery(filtro)}`),
  buscar: (id: number) => api.get<Treino>(`/treinos/${id}`),
  criar: (dados: TreinoPayload) => api.post<Treino>("/treinos", dados),
  atualizar: (id: number, dados: TreinoPayload) => api.put<Treino>(`/treinos/${id}`, dados),
  excluir: (id: number) => api.delete(`/treinos/${id}`),
};
