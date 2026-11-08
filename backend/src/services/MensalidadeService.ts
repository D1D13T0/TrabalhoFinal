import { AlunoDAO } from "../daos/AlunoDAO";
import { PagamentoDAO } from "../daos/PagamentoDAO";
import { NaoEncontradoError } from "../errors/AppError";
import { diferencaEmDias, formatarData, formatarMes } from "../utils/datas";

// Quantos dias antes do vencimento o aluno começa a ser avisado.
export const DIAS_AVISO = 5;

export type StatusMensalidade = "PAGA" | "EM_ABERTO" | "A_VENCER" | "ATRASADA";

// Calcula a situação da mensalidade do mês atual de um aluno.
export function calcularStatus(
  aluno: { diaVencimento: number; plano: { valor: number } },
  pagamentoDoMes: { pago: boolean } | null | undefined,
  hoje = new Date(),
) {
  const vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), aluno.diaVencimento);
  const diasParaVencer = diferencaEmDias(hoje, vencimento);

  let status: StatusMensalidade = "EM_ABERTO";
  if (pagamentoDoMes?.pago) status = "PAGA";
  else if (diasParaVencer < 0) status = "ATRASADA";
  else if (diasParaVencer <= DIAS_AVISO) status = "A_VENCER";

  return {
    status,
    mesReferencia: formatarMes(hoje),
    vencimento: formatarData(vencimento),
    diasParaVencer,
    valor: aluno.plano.valor,
  };
}

export const MensalidadeService = {
  async statusDoAluno(alunoId: number) {
    const aluno = await AlunoDAO.buscarPorId(alunoId);
    if (!aluno) throw new NaoEncontradoError("Aluno");
    const pagamento = await PagamentoDAO.buscarDoMes(alunoId, formatarMes(new Date()));
    return calcularStatus(aluno, pagamento);
  },

  // Resumo para a tela inicial do admin.
  async dashboard() {
    const mes = formatarMes(new Date());
    const alunos = await AlunoDAO.listarAtivosComPagamentoDoMes(mes);
    const recebido = await PagamentoDAO.somarRecebidoNoMes(mes);

    const situacoes = alunos.map((a) => ({
      alunoId: a.id,
      nome: a.usuario.nome,
      foto: a.foto,
      ...calcularStatus(a, a.pagamentos[0]),
    }));

    return {
      mesReferencia: mes,
      alunosAtivos: alunos.length,
      recebidoNoMes: recebido._sum.valor ?? 0,
      atrasados: situacoes.filter((s) => s.status === "ATRASADA"),
      aVencer: situacoes.filter((s) => s.status === "A_VENCER"),
    };
  },
};
