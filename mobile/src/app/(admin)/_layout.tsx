import { opcoesCabecalho } from "@/theme";
import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

// Pilha do admin (Navigation Pages): o menu lateral fica na base
// e os formulários abrem por cima, com botão de voltar.
export default function AdminLayout() {
  const tema = useTheme();

  return (
    <Stack screenOptions={{ ...opcoesCabecalho(tema), headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="aluno/novo" options={{ title: "Novo aluno" }} />
      <Stack.Screen name="aluno/[id]" options={{ title: "Editar aluno" }} />
      <Stack.Screen name="plano/novo" options={{ title: "Novo plano" }} />
      <Stack.Screen name="plano/[id]" options={{ title: "Editar plano" }} />
      <Stack.Screen name="exercicio/novo" options={{ title: "Novo exercício" }} />
      <Stack.Screen name="exercicio/[id]" options={{ title: "Editar exercício" }} />
      <Stack.Screen name="aluno/treinos/[id]" options={{ title: "Treinos do aluno" }} />
      <Stack.Screen name="pagamento/novo" options={{ title: "Registrar pagamento" }} />
      <Stack.Screen name="pagamento/[id]" options={{ title: "Editar pagamento" }} />
      <Stack.Screen name="treino/novo" options={{ title: "Novo treino" }} />
      <Stack.Screen name="treino/[id]" options={{ title: "Editar treino" }} />
      <Stack.Screen
        name="treino/selecionar-exercicio"
        options={{ title: "Selecionar exercício", presentation: "modal" }}
      />
    </Stack>
  );
}
