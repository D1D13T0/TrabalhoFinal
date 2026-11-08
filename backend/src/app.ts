import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { PASTA_UPLOADS } from "./middlewares/upload";
import { routes } from "./routes";

export const app = express();

app.use(cors());
app.use(express.json());

// Fotos de alunos e imagens de exercícios: GET /uploads/<arquivo>
app.use("/uploads", express.static(PASTA_UPLOADS));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(routes);
app.use(errorHandler);
