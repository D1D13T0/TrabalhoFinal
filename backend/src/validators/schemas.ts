import { z } from "zod";

// Validações dos dados recebidos nas rotas (corpo das requisições).

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD.");
const mes = z.string().regex(/^\d{4}-\d{2}$/, "Use o formato AAAA-MM.");
const texto = (campo: string) => z.string().trim().min(1, `${campo} é obrigatório.`);
const DIAS_SEMANA = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"] as const;

export const loginSchema = z.object({
  email: z.email("E-mail inválido.").trim().toLowerCase(),
  senha: z.string().min(1, "Senha é obrigatória."),
});

export const trocarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória."),
  novaSenha: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
});

export const planoSchema = z.object({
  nome: texto("Nome"),
  diasPorSemana: z.number().int().min(1).max(7),
  valor: z.number().positive("Valor deve ser maior que zero."),
  ativo: z.boolean().default(true),
});

const alunoBase = z.object({
  nome: texto("Nome"),
  email: z.email("E-mail inválido.").trim().toLowerCase(),
  planoId: z.number().int().positive(),
  telefone: texto("Telefone"),
  dataNascimento: data,
  sexo: z.enum(["M", "F", "O"]),
  diaVencimento: z.number().int().min(1).max(28, "Use um dia entre 1 e 28."),
  diasTreino: z.array(z.enum(DIAS_SEMANA)).min(1, "Selecione ao menos um dia de treino."),
  possuiRestricaoMedica: z.boolean().default(false),
  observacoes: z.string().trim().nullish(),
  ativo: z.boolean().default(true),
});

export const alunoCriarSchema = alunoBase.extend({
  senhaInicial: z.string().min(6, "A senha inicial deve ter pelo menos 6 caracteres."),
});

export const alunoAtualizarSchema = alunoBase;

export const pagamentoSchema = z.object({
  alunoId: z.number().int().positive(),
  mesReferencia: mes,
  valor: z.number().positive("Valor deve ser maior que zero."),
  formaPagamento: z.enum(["PIX", "CARTAO", "DINHEIRO"]),
  pago: z.boolean(),
  dataPagamento: data.nullish(),
});

export const exercicioSchema = z.object({
  nome: texto("Nome"),
  grupoMuscular: texto("Grupo muscular"),
  descricao: z.string().trim().nullish(),
  ativo: z.boolean().default(true),
});

export const treinoSchema = z.object({
  alunoId: z.number().int().positive(),
  nome: texto("Nome"),
  observacoes: z.string().trim().nullish(),
  ativo: z.boolean().default(true),
  itens: z
    .array(
      z.object({
        exercicioId: z.number().int().positive(),
        series: z.number().int().min(1),
        repeticoes: texto("Repetições"),
        carga: z.number().min(0).nullish(),
        descansoSegundos: z.number().int().min(0).nullish(),
      }),
    )
    .min(1, "Adicione ao menos um exercício."),
});

export const idParamSchema = z.coerce.number().int().positive();

export type PlanoInput = z.infer<typeof planoSchema>;
export type AlunoCriarInput = z.infer<typeof alunoCriarSchema>;
export type AlunoAtualizarInput = z.infer<typeof alunoAtualizarSchema>;
export type PagamentoInput = z.infer<typeof pagamentoSchema>;
export type ExercicioInput = z.infer<typeof exercicioSchema>;
export type TreinoInput = z.infer<typeof treinoSchema>;
