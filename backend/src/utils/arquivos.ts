import { unlink } from "node:fs/promises";
import path from "node:path";
import { PASTA_UPLOADS } from "../middlewares/upload";

// Apaga uma imagem antiga da pasta uploads (ignora se já não existir).
export async function removerUpload(arquivo: string | null | undefined) {
  if (!arquivo) return;
  try {
    await unlink(path.join(PASTA_UPLOADS, path.basename(arquivo)));
  } catch {
    // arquivo já removido ou inexistente: nada a fazer
  }
}
