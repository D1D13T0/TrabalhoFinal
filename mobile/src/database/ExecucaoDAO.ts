import type { SQLiteDatabase } from "expo-sqlite";

// DAO dos exercícios marcados como feitos (tabela execucao).
export function criarExecucaoDAO(db: SQLiteDatabase) {
  return {
    // Ids dos itens do treino concluídos na data.
    async concluidosNoDia(treinoId: number, data: string): Promise<Set<number>> {
      const linhas = await db.getAllAsync<{ treino_item_id: number }>(
        `SELECT e.treino_item_id
           FROM execucao e
           JOIN treino_item i ON i.id = e.treino_item_id
          WHERE i.treino_id = ? AND e.data = ? AND e.concluido = 1`,
        treinoId,
        data,
      );
      return new Set(linhas.map((l) => l.treino_item_id));
    },

    async marcar(treinoItemId: number, data: string) {
      await db.runAsync(
        `INSERT INTO execucao (treino_item_id, data, concluido) VALUES (?, ?, 1)
         ON CONFLICT(treino_item_id, data) DO UPDATE SET concluido = 1`,
        treinoItemId,
        data,
      );
    },

    async desmarcar(treinoItemId: number, data: string) {
      await db.runAsync("DELETE FROM execucao WHERE treino_item_id = ? AND data = ?", treinoItemId, data);
    },

    async limparDia(treinoId: number, data: string) {
      await db.runAsync(
        "DELETE FROM execucao WHERE data = ? AND treino_item_id IN (SELECT id FROM treino_item WHERE treino_id = ?)",
        data,
        treinoId,
      );
    },

    // Quantos dias diferentes o aluno concluiu algum exercício nos últimos 7 dias.
    async diasAtivosNaSemana(desde: string): Promise<number> {
      const linha = await db.getFirstAsync<{ total: number }>(
        "SELECT COUNT(DISTINCT data) AS total FROM execucao WHERE concluido = 1 AND data >= ?",
        desde,
      );
      return linha?.total ?? 0;
    },
  };
}
