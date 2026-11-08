import { FormularioAluno } from "@/components/FormularioAluno";
import { useLocalSearchParams } from "expo-router";

export default function EditarAlunoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FormularioAluno alunoId={Number(id)} />;
}
