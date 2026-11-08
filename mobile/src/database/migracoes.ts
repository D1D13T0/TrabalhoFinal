import type { SQLiteDatabase } from "expo-sqlite";

// Banco SQLite LOCAL (no celular do aluno): guarda uma cópia dos treinos para usar sem internet
// e registra os exercícios concluídos no dia.
export const NOME_BANCO = "perfformance.db";
const VERSAO_BANCO = 1;

export async function migrarBanco(db: SQLiteDatabase) {
  // Vale por conexão: precisa ser ligado toda vez que o banco é aberto (para o ON DELETE CASCADE).
  await db.execAsync("PRAGMA foreign_keys = ON;");

  const linha = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let versaoAtual = linha?.user_version ?? 0;
  if (versaoAtual >= VERSAO_BANCO) return;

  if (versaoAtual === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      -- Ficha de treino (cópia do servidor)
      CREATE TABLE IF NOT EXISTS treino (
        id            INTEGER PRIMARY KEY NOT NULL,  -- mesmo id do servidor
        aluno_id      INTEGER NOT NULL,
        nome          TEXT    NOT NULL,
        observacoes   TEXT,
        ativo         INTEGER NOT NULL DEFAULT 1     -- booleano (0/1)
      );

      -- Exercícios de cada ficha
      CREATE TABLE IF NOT EXISTS treino_item (
        id                 INTEGER PRIMARY KEY NOT NULL,
        treino_id          INTEGER NOT NULL REFERENCES treino(id) ON DELETE CASCADE,
        ordem              INTEGER NOT NULL,
        exercicio_nome     TEXT    NOT NULL,
        grupo_muscular     TEXT    NOT NULL,
        exercicio_descricao TEXT,
        imagem             TEXT,
        series             INTEGER NOT NULL,
        repeticoes         TEXT    NOT NULL,
        carga              REAL,
        descanso_segundos  INTEGER
      );

      -- Exercícios marcados como feitos pelo aluno (por dia)
      CREATE TABLE IF NOT EXISTS execucao (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        treino_item_id INTEGER NOT NULL REFERENCES treino_item(id) ON DELETE CASCADE,
        data           TEXT    NOT NULL,             -- AAAA-MM-DD
        concluido      INTEGER NOT NULL DEFAULT 1,   -- booleano (0/1)
        UNIQUE (treino_item_id, data)
      );

      -- Pares chave/valor: data da última sincronização, situação da mensalidade etc.
      CREATE TABLE IF NOT EXISTS preferencia (
        chave TEXT PRIMARY KEY NOT NULL,
        valor TEXT
      );
    `);
    versaoAtual = 1;
  }

  // Próximas mudanças de estrutura entram aqui: if (versaoAtual === 1) { ...; versaoAtual = 2; }

  await db.execAsync(`PRAGMA user_version = ${VERSAO_BANCO}`);
}
