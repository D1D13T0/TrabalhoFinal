import { randomUUID } from "node:crypto";
import path from "node:path";
import multer from "multer";
import { AppError } from "../errors/AppError";

export const PASTA_UPLOADS = path.resolve("uploads");

const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

// Recebe um único arquivo de imagem no campo "imagem" (até 5 MB).
export const uploadImagem = multer({
  storage: multer.diskStorage({
    destination: PASTA_UPLOADS,
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname) || ".jpg"}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (tiposPermitidos.includes(file.mimetype)) cb(null, true);
    else cb(new AppError("Envie uma imagem JPG, PNG ou WEBP."));
  },
}).single("imagem");
