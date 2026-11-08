import { useAuth } from "@/contexts/AuthContext";
import { DrawerContentScrollView, DrawerItemList, type DrawerContentComponentProps } from "expo-router/drawer";
import { StyleSheet, View } from "react-native";
import { Divider, Drawer as PaperDrawer, Text, useTheme } from "react-native-paper";
import { Logo } from "./Logo";

// Conteúdo do menu lateral (Flyout): logo, usuário logado, itens e botão Sair.
export function MenuLateral(props: DrawerContentComponentProps) {
  const { usuario, sair } = useAuth();
  const tema = useTheme();

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.cabecalho}>
        <Logo tamanho={150} />
        <Text variant="titleMedium" style={{ fontWeight: "700", marginTop: 12 }}>
          {usuario?.nome}
        </Text>
        <Text variant="bodySmall" style={{ color: tema.colors.onSurfaceVariant }}>
          {usuario?.email}
        </Text>
      </View>
      <Divider style={styles.divisor} />
      <DrawerItemList {...props} />
      <Divider style={styles.divisor} />
      <PaperDrawer.Item label="Sair" icon="logout" onPress={sair} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  cabecalho: { alignItems: "center", paddingVertical: 16 },
  divisor: { marginVertical: 8 },
});
