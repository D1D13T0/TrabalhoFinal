import type { Plano } from "@/models";
import { api, montarQuery } from "./api";

export interface PlanoPayload {
  nome: string;
  diasPorSemana: number;
  valor: number;
  ativo: boolean;
}

export const planoService = {
  listar: (filtro: { ativo?: boolean } = {}) => api.get<Plano[]>(`/planos${montarQuery(filtro)}`),
  buscar: (id: number) => api.get<Plano>(`/planos/${id}`),
  criar: (dados: PlanoPayload) => api.post<Plano>("/planos", dados),
  atualizar: (id: number, dados: PlanoPayload) => api.put<Plano>(`/planos/${id}`, dados),
  excluir: (id: number) => api.delete(`/planos/${id}`),
};
