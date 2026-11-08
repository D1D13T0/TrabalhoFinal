import { ListaTreinos } from "@/components/ListaTreinos";
import { Stack, useLocalSearchParams } from "expo-router";

// Treinos de um aluno específico (aberto a partir da tela do aluno).
export default function TreinosDoAlunoScreen() {
  const { id, nome } = useLocalSearchParams<{ id: string; nome?: string }>();
  return (
    <>
      <Stack.Screen options={{ title: nome ? `Treinos de ${nome}` : "Treinos do aluno" }} />
      <ListaTreinos alunoId={Number(id)} />
    </>
  );
}
