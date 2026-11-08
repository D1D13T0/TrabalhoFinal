import { FormularioPlano } from "@/components/FormularioPlano";
import { useLocalSearchParams } from "expo-router";

export default function EditarPlanoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FormularioPlano planoId={Number(id)} />;
}
