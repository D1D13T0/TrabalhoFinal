import { FormularioPagamento } from "@/components/FormularioPagamento";
import { useLocalSearchParams } from "expo-router";

export default function EditarPagamentoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FormularioPagamento pagamentoId={Number(id)} />;
}
