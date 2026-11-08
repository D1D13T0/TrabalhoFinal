import { marca, opcoesCabecalho } from "@/theme";
import { iconeNavegacao as icone } from "@/components/iconeNavegacao";
import { Tabs } from "expo-router/tabs";
import { useTheme } from "react-native-paper";

// Área do aluno: abas com treinos, mensalidade e perfil.
export default function AlunoTabsLayout() {
  const tema = useTheme();

  return (
    <Tabs
      screenOptions={{
        ...opcoesCabecalho(tema),
        tabBarActiveTintColor: tema.dark ? tema.colors.primary : marca.vermelho,
        tabBarInactiveTintColor: tema.colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: tema.colors.surface },
      }}
    >
      <Tabs.Screen name="meus-treinos" options={{ title: "Meus treinos", tabBarIcon: icone("dumbbell") }} />
      <Tabs.Screen name="mensalidade" options={{ title: "Mensalidade", tabBarIcon: icone("cash") }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil", tabBarIcon: icone("account-circle-outline") }} />
    </Tabs>
  );
}
