import { Logo } from "@/components/Logo";
import { API_URL } from "@/services/api";
import Constants from "expo-constants";
import { ScrollView, StyleSheet } from "react-native";
import { Divider, List, Surface, Text, useTheme } from "react-native-paper";

// Tela "Sobre": informações do aplicativo.
export default function SobreScreen() {
  const tema = useTheme();
  return (
    <ScrollView style={{ backgroundColor: tema.colors.background }} contentContainerStyle={styles.conteudo}>
      <Logo tamanho={200} />
      <Text variant="headlineSmall" style={{ fontWeight: "700", color: tema.colors.primary }}>
        PerfformanceApp
      </Text>
      <Text variant="bodyMedium" style={{ textAlign: "center" }}>
        Gestão de alunos, treinos e mensalidades da Perfformance Academia.
      </Text>

      <Surface style={styles.secao} elevation={1}>
        <List.Item title="Versão" description={Constants.expoConfig?.version ?? "1.0.0"} left={(p) => <List.Icon {...p} icon="information-outline" />} />
        <Divider />
        <List.Item title="Servidor" description={API_URL} left={(p) => <List.Icon {...p} icon="server-network" />} />
        <Divider />
        <List.Item title="Tecnologias" description="React Native (Expo) • Node.js • Express • Prisma • SQLite" descriptionNumberOfLines={2} left={(p) => <List.Icon {...p} icon="code-tags" />} />
        <Divider />
        <List.Item title="Arquitetura" description="MVVM: Models, Views (telas) e ViewModels (hooks)" descriptionNumberOfLines={2} left={(p) => <List.Icon {...p} icon="sitemap-outline" />} />
      </Surface>

      <Text variant="labelSmall" style={{ color: tema.colors.onSurfaceVariant }}>
        Trabalho final — Programação para Dispositivos Móveis
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 12, alignItems: "center", maxWidth: 720, width: "100%", alignSelf: "center" },
  secao: { borderRadius: 16, alignSelf: "stretch", overflow: "hidden" },
});
