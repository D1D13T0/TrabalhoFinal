import type { Treino } from "@/models";
import { treinoService } from "@/services/treinoService";
import { useListaCrud } from "./useListaCrud";

// ViewModel da lista de treinos. Com alunoId, mostra só os treinos daquele aluno.
export function useTreinosListaViewModel(alunoId?: number) {
  return useListaCrud<Treino>({
    carregar: () => treinoService.listar({ alunoId }),
    excluir: (t) => treinoService.excluir(t.id),
    textoBusca: (t) => [t.nome, t.aluno.usuario.nome, ...t.itens.map((i) => i.exercicio.nome)],
    ativo: (t) => t.ativo,
    nome: (t) => t.nome,
  });
}
