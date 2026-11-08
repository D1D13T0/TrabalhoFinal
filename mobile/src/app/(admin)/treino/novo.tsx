import { FormularioTreino } from "@/components/FormularioTreino";
import { useLocalSearchParams } from "expo-router";

export default function NovoTreinoScreen() {
  const { alunoId } = useLocalSearchParams<{ alunoId?: string }>();
  return <FormularioTreino alunoId={alunoId ? Number(alunoId) : undefined} />;
}
