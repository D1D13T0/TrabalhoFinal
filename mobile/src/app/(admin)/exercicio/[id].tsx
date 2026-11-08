import { FormularioExercicio } from "@/components/FormularioExercicio";
import { useLocalSearchParams } from "expo-router";

export default function EditarExercicioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FormularioExercicio exercicioId={Number(id)} />;
}
