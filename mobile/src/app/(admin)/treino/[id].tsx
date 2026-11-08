import { FormularioTreino } from "@/components/FormularioTreino";
import { useLocalSearchParams } from "expo-router";

export default function EditarTreinoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FormularioTreino treinoId={Number(id)} />;
}
