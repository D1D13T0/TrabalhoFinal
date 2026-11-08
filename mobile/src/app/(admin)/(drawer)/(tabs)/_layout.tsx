import { marca, opcoesCabecalho } from "@/theme";
import { iconeNavegacao as icone } from "@/components/iconeNavegacao";
import { DrawerToggleButton } from "expo-router/drawer";
import { Tabs } from "expo-router/tabs";
import { useTheme } from "react-native-paper";

// Abas principais do admin (Tabbed Pages). O botão ☰ abre o menu lateral.
export default function AdminTabsLayout() {
  const tema = useTheme();

  return (
    <Tabs
      screenOptions={{
        ...opcoesCabecalho(tema),
        headerLeft: () => <DrawerToggleButton tintColor={marca.branco} />,
        tabBarActiveTintColor: tema.dark ? tema.colors.primary : marca.vermelho,
        tabBarInactiveTintColor: tema.colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: tema.colors.surface },
      }}
    >
      <Tabs.Screen name="inicio" options={{ title: "Início", tabBarIcon: icone("view-dashboard-outline") }} />
      <Tabs.Screen name="alunos" options={{ title: "Alunos", tabBarIcon: icone("account-group-outline") }} />
      <Tabs.Screen name="pagamentos" options={{ title: "Pagamentos", tabBarIcon: icone("cash-multiple") }} />
    </Tabs>
  );
}
