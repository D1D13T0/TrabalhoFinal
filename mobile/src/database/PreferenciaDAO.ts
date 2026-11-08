import type { SQLiteDatabase } from "expo-sqlite";

// DAO de pares chave/valor (tabela preferencia). Valores são guardados como JSON.
export function criarPreferenciaDAO(db: SQLiteDatabase) {
  return {
    async ler<T>(chave: string): Promise<T | null> {
      const linha = await db.getFirstAsync<{ valor: string | null }>(
        "SELECT valor FROM preferencia WHERE chave = ?",
        chave,
      );
      if (!linha?.valor) return null;
      try {
        return JSON.parse(linha.valor) as T;
      } catch {
        return null;
      }
    },

    async salvar(chave: string, valor: unknown) {
      await db.runAsync(
        `INSERT INTO preferencia (chave, valor) VALUES (?, ?)
         ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`,
        chave,
        JSON.stringify(valor),
      );
    },

    async remover(chave: string) {
      await db.runAsync("DELETE FROM preferencia WHERE chave = ?", chave);
    },
  };
}
