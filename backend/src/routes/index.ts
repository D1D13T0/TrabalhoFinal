import { Router } from "express";
import {
  AlunoController,
  DashboardController,
  ExercicioController,
  PagamentoController,
  PlanoController,
  TreinoController,
} from "../controllers/AdminControllers";
import { AlunoAreaController } from "../controllers/AlunoAreaController";
import { AuthController } from "../controllers/AuthController";
import { autenticar, exigirPerfil } from "../middlewares/auth";
import { uploadImagem } from "../middlewares/upload";

export const routes = Router();

// Públicas
routes.post("/auth/login", AuthController.login);

// Qualquer usuário logado
routes.use(autenticar);
routes.get("/auth/me", AuthController.me);
routes.put("/auth/senha", AuthController.trocarSenha);

// Área do aluno (dados do próprio aluno logado)
const aluno = Router();
aluno.use(exigirPerfil("ALUNO"));
aluno.get("/perfil", AlunoAreaController.perfil);
aluno.get("/treinos", AlunoAreaController.treinos);
aluno.get("/pagamentos", AlunoAreaController.pagamentos);
aluno.get("/mensalidade", AlunoAreaController.mensalidade);
routes.use("/me", aluno);

// Área do admin
const admin = Router();
admin.use(exigirPerfil("ADMIN"));

admin.get("/dashboard", DashboardController.resumo);

admin.get("/planos", PlanoController.listar);
admin.get("/planos/:id", PlanoController.buscar);
admin.post("/planos", PlanoController.criar);
admin.put("/planos/:id", PlanoController.atualizar);
admin.delete("/planos/:id", PlanoController.excluir);

admin.get("/alunos", AlunoController.listar);
admin.get("/alunos/:id", AlunoController.buscar);
admin.get("/alunos/:id/mensalidade", AlunoController.mensalidade);
admin.post("/alunos", AlunoController.criar);
admin.put("/alunos/:id", AlunoController.atualizar);
admin.post("/alunos/:id/foto", uploadImagem, AlunoController.enviarFoto);
admin.delete("/alunos/:id", AlunoController.excluir);

admin.get("/exercicios", ExercicioController.listar);
admin.get("/exercicios/:id", ExercicioController.buscar);
admin.post("/exercicios", ExercicioController.criar);
admin.put("/exercicios/:id", ExercicioController.atualizar);
admin.post("/exercicios/:id/imagem", uploadImagem, ExercicioController.enviarImagem);
admin.delete("/exercicios/:id", ExercicioController.excluir);

admin.get("/treinos", TreinoController.listar);
admin.get("/treinos/:id", TreinoController.buscar);
admin.post("/treinos", TreinoController.criar);
admin.put("/treinos/:id", TreinoController.atualizar);
admin.delete("/treinos/:id", TreinoController.excluir);

admin.get("/pagamentos", PagamentoController.listar);
admin.get("/pagamentos/:id", PagamentoController.buscar);
admin.post("/pagamentos", PagamentoController.criar);
admin.put("/pagamentos/:id", PagamentoController.atualizar);
admin.delete("/pagamentos/:id", PagamentoController.excluir);

routes.use(admin);
