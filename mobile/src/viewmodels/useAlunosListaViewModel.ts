import type { Aluno } from "@/models";
import { alunoService } from "@/services/alunoService";
import { useListaCrud } from "./useListaCrud";

export type { FiltroSituacao } from "./useListaCrud";

// ViewModel da lista de alunos.
export function useAlunosListaViewModel() {
  return useListaCrud<Aluno>({
    carregar: alunoService.listar,
    excluir: (a) => alunoService.excluir(a.id),
    textoBusca: (a) => [a.usuario.nome, a.usuario.email, a.telefone, a.plano.nome],
    ativo: (a) => a.ativo,
    nome: (a) => a.usuario.nome,
  });
}
