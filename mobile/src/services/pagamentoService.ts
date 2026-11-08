import type { FormaPagamento, Mensalidade, Pagamento } from "@/models";
import { api, montarQuery } from "./api";

export interface PagamentoPayload {
  alunoId: number;
  mesReferencia: string; // AAAA-MM
  valor: number;
  formaPagamento: FormaPagamento;
  pago: boolean;
  dataPagamento: string | null; // AAAA-MM-DD
}

export interface SituacaoAluno extends Mensalidade {
  alunoId: number;
  nome: string;
  foto: string | null;
}

export interface Dashboard {
  mesReferencia: string;
  alunosAtivos: number;
  recebidoNoMes: number;
  atrasados: SituacaoAluno[];
  aVencer: SituacaoAluno[];
}

export const FORMAS_PAGAMENTO: { valor: FormaPagamento; rotulo: string; icone: string }[] = [
  { valor: "PIX", rotulo: "Pix", icone: "qrcode" },
  { valor: "CARTAO", rotulo: "Cartão", icone: "credit-card-outline" },
  { valor: "DINHEIRO", rotulo: "Dinheiro", icone: "cash" },
];

export const pagamentoService = {
  listar: (filtro: { mes?: string; alunoId?: number } = {}) => api.get<Pagamento[]>(`/pagamentos${montarQuery(filtro)}`),
  buscar: (id: number) => api.get<Pagamento>(`/pagamentos/${id}`),
  criar: (dados: PagamentoPayload) => api.post<Pagamento>("/pagamentos", dados),
  atualizar: (id: number, dados: PagamentoPayload) => api.put<Pagamento>(`/pagamentos/${id}`, dados),
  excluir: (id: number) => api.delete(`/pagamentos/${id}`),
  dashboard: () => api.get<Dashboard>("/dashboard"),
};
