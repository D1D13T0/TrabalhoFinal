import type { Treino } from "@/models";
import type { SQLiteDatabase } from "expo-sqlite";

// Formato dos treinos lidos do banco local.
export interface TreinoLocal {
  id: number;
  alunoId: number;
  nome: string;
  observacoes: string | null;
  ativo: boolean;
  totalItens: number;
}

export interface TreinoItemLocal {
  id: number;
  treinoId: number;
  ordem: number;
  exercicioNome: string;
  grupoMuscular: string;
  exercicioDescricao: string | null;
  imagem: string | null;
  series: number;
  repeticoes: string;
  carga: number | null;
  descansoSegundos: number | null;
}

interface LinhaTreino {
  id: number;
  aluno_id: number;
  nome: string;
  observacoes: string | null;
  ativo: number;
  total_itens: number;
}

interface LinhaItem {
  id: number;
  treino_id: number;
  ordem: number;
  exercicio_nome: string;
  grupo_muscular: string;
  exercicio_descricao: string | null;
  imagem: string | null;
  series: number;
  repeticoes: string;
  carga: number | null;
  descanso_segundos: number | null;
}

// DAO da cópia local dos treinos (tabelas treino e treino_item).
export function criarTreinoLocalDAO(db: SQLiteDatabase) {
  return {
    async listar(alunoId: number): Promise<TreinoLocal[]> {
      const linhas = await db.getAllAsync<LinhaTreino>(
        `SELECT t.*, (SELECT COUNT(*) FROM treino_item i WHERE i.treino_id = t.id) AS total_itens
           FROM treino t
          WHERE t.aluno_id = ? AND t.ativo = 1
          ORDER BY t.nome`,
        alunoId,
      );
      return linhas.map((l) => ({
        id: l.id,
        alunoId: l.aluno_id,
        nome: l.nome,
        observacoes: l.observacoes,
        ativo: l.ativo === 1,
        totalItens: l.total_itens,
      }));
    },

    async buscar(id: number, alunoId: number): Promise<(TreinoLocal & { itens: TreinoItemLocal[] }) | null> {
      const t = await db.getFirstAsync<LinhaTreino>(
        `SELECT t.*, 0 AS total_itens FROM treino t WHERE t.id = ? AND t.aluno_id = ?`,
        id,
        alunoId,
      );
      if (!t) return null;
      const itens = await db.getAllAsync<LinhaItem>(
        "SELECT * FROM treino_item WHERE treino_id = ? ORDER BY ordem",
        id,
      );
      return {
        id: t.id,
        alunoId: t.aluno_id,
        nome: t.nome,
        observacoes: t.observacoes,
        ativo: t.ativo === 1,
        totalItens: itens.length,
        itens: itens.map((i) => ({
          id: i.id,
          treinoId: i.treino_id,
          ordem: i.ordem,
          exercicioNome: i.exercicio_nome,
          grupoMuscular: i.grupo_muscular,
          exercicioDescricao: i.exercicio_descricao,
          imagem: i.imagem,
          series: i.series,
          repeticoes: i.repeticoes,
          carga: i.carga,
          descansoSegundos: i.descanso_segundos,
        })),
      };
    },

    // Substitui a cópia local pelos treinos recebidos do servidor (numa transação).
    // Itens que continuam existindo mantêm o id, então as marcações do dia são preservadas.
    async substituirTodos(alunoId: number, treinos: Treino[]) {
      await db.withTransactionAsync(async () => {
        const idsTreinos = treinos.map((t) => t.id);
        // Remove treinos que não existem mais no servidor (itens e execuções caem em cascata).
        if (idsTreinos.length === 0) {
          await db.runAsync("DELETE FROM treino WHERE aluno_id = ?", alunoId);
        } else {
          await db.runAsync(
            `DELETE FROM treino WHERE aluno_id = ? AND id NOT IN (${idsTreinos.map(() => "?").join(",")})`,
            alunoId,
            ...idsTreinos,
          );
        }
        for (const t of treinos) {
          await db.runAsync(
            `INSERT INTO treino (id, aluno_id, nome, observacoes, ativo) VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET aluno_id = excluded.aluno_id, nome = excluded.nome,
               observacoes = excluded.observacoes, ativo = excluded.ativo`,
            t.id,
            alunoId,
            t.nome,
            t.observacoes,
            t.ativo ? 1 : 0,
          );
          if (t.itens.length === 0) {
            await db.runAsync("DELETE FROM treino_item WHERE treino_id = ?", t.id);
          } else {
            await db.runAsync(
              `DELETE FROM treino_item WHERE treino_id = ? AND id NOT IN (${t.itens.map(() => "?").join(",")})`,
              t.id,
              ...t.itens.map((i) => i.id),
            );
          }
          for (const i of t.itens) {
            await db.runAsync(
              `INSERT INTO treino_item (id, treino_id, ordem, exercicio_nome, grupo_muscular, exercicio_descricao,
                 imagem, series, repeticoes, carga, descanso_segundos)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET treino_id = excluded.treino_id, ordem = excluded.ordem,
                 exercicio_nome = excluded.exercicio_nome, grupo_muscular = excluded.grupo_muscular,
                 exercicio_descricao = excluded.exercicio_descricao, imagem = excluded.imagem,
                 series = excluded.series, repeticoes = excluded.repeticoes, carga = excluded.carga,
                 descanso_segundos = excluded.descanso_segundos`,
              i.id,
              t.id,
              i.ordem,
              i.exercicio.nome,
              i.exercicio.grupoMuscular,
              i.exercicio.descricao,
              i.exercicio.imagem,
              i.series,
              i.repeticoes,
              i.carga,
              i.descansoSegundos,
            );
          }
        }
      });
    },

    // Apaga toda a cópia local do aluno (botão "Limpar dados offline").
    async limpar(alunoId: number) {
      await db.runAsync("DELETE FROM treino WHERE aluno_id = ?", alunoId);
    },
  };
}
