import { opcoesCabecalho } from "@/theme";
import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

// Área do aluno: a tela do treino abre empilhada por cima das abas.
// (O banco SQLite local é aberto no layout raiz, antes da navegação.)
export default function AlunoLayout() {
  const tema = useTheme();

  return (
    <Stack screenOptions={{ ...opcoesCabecalho(tema), headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="meu-treino/[id]" options={{ title: "Treino" }} />
    </Stack>
  );
}
