import type { Aluno, Mensalidade, Pagamento, Treino } from "@/models";
import { api } from "./api";

// Rotas do perfil ALUNO: sempre retornam os dados do próprio aluno logado.
export const alunoAreaService = {
  perfil: () => api.get<Aluno>("/me/perfil"),
  treinos: () => api.get<Treino[]>("/me/treinos"),
  pagamentos: () => api.get<Pagamento[]>("/me/pagamentos"),
  mensalidade: () => api.get<Mensalidade>("/me/mensalidade"),
};
