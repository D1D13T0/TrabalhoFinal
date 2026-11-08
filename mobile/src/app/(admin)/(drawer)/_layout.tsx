import { MenuLateral } from "@/components/MenuLateral";
import { marca, opcoesCabecalho } from "@/theme";
import { iconeNavegacao as icone } from "@/components/iconeNavegacao";
import { Drawer } from "expo-router/drawer";
import { useTheme } from "react-native-paper";

// Área do admin: menu lateral (Flyout) com as abas principais e os cadastros auxiliares.
export default function AdminDrawerLayout() {
  const tema = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <MenuLateral {...props} />}
      screenOptions={{
        ...opcoesCabecalho(tema),
        drawerActiveTintColor: tema.dark ? tema.colors.onPrimaryContainer : marca.azul,
        drawerActiveBackgroundColor: tema.colors.primaryContainer,
        drawerInactiveTintColor: tema.colors.onSurface,
        drawerStyle: { backgroundColor: tema.colors.surface },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{ title: "Início", headerShown: false, drawerIcon: icone("home-outline") }}
      />
      <Drawer.Screen name="treinos" options={{ title: "Treinos", drawerIcon: icone("clipboard-list-outline") }} />
      <Drawer.Screen name="planos" options={{ title: "Planos", drawerIcon: icone("card-account-details-outline") }} />
      <Drawer.Screen name="exercicios" options={{ title: "Exercícios", drawerIcon: icone("dumbbell") }} />
      <Drawer.Screen name="sobre" options={{ title: "Sobre", drawerIcon: icone("information-outline") }} />
    </Drawer>
  );
}
