import { FormularioPagamento } from "@/components/FormularioPagamento";
import { useLocalSearchParams } from "expo-router";

export default function NovoPagamentoScreen() {
  const { alunoId, mes } = useLocalSearchParams<{ alunoId?: string; mes?: string }>();
  return <FormularioPagamento alunoId={alunoId ? Number(alunoId) : undefined} mes={mes} />;
}
