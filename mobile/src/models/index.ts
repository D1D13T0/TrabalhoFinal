// Models: formato dos dados que vêm da API.

export type Perfil = "ADMIN" | "ALUNO";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  trocarSenha: boolean;
  alunoId: number | null;
}

export interface Sessao {
  token: string;
  usuario: Usuario;
}

export type DiaSemana = "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB" | "DOM";
export type Sexo = "M" | "F" | "O";
export type FormaPagamento = "PIX" | "CARTAO" | "DINHEIRO";
export type StatusMensalidade = "PAGA" | "EM_ABERTO" | "A_VENCER" | "ATRASADA";

export interface Plano {
  id: number;
  nome: string;
  diasPorSemana: number;
  valor: number;
  ativo: boolean;
  _count?: { alunos: number };
}

export interface Aluno {
  id: number;
  usuarioId: number;
  planoId: number;
  telefone: string;
  dataNascimento: string;
  sexo: Sexo;
  foto: string | null;
  diaVencimento: number;
  diasTreino: DiaSemana[];
  possuiRestricaoMedica: boolean;
  observacoes: string | null;
  ativo: boolean;
  usuario: { id: number; nome: string; email: string };
  plano: Plano;
}

export interface Exercicio {
  id: number;
  nome: string;
  grupoMuscular: string;
  imagem: string | null;
  descricao: string | null;
  ativo: boolean;
}

export interface TreinoItem {
  id: number;
  exercicioId: number;
  ordem: number;
  series: number;
  repeticoes: string;
  carga: number | null;
  descansoSegundos: number | null;
  exercicio: Exercicio;
}

export interface Treino {
  id: number;
  alunoId: number;
  nome: string;
  observacoes: string | null;
  ativo: boolean;
  aluno: { id: number; usuario: { nome: string } };
  itens: TreinoItem[];
}

export interface Pagamento {
  id: number;
  alunoId: number;
  mesReferencia: string;
  valor: number;
  formaPagamento: FormaPagamento;
  pago: boolean;
  dataPagamento: string | null;
  aluno: { id: number; usuario: { nome: string } };
}

export interface Mensalidade {
  status: StatusMensalidade;
  mesReferencia: string;
  vencimento: string;
  diasParaVencer: number;
  valor: number;
}
