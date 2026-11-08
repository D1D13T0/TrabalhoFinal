import { nomeMes, somarMes } from "@/utils/formatacao";
import { StyleSheet, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";

// Seletor "‹ Novembro de 2026 ›" para escolher o mês de referência.
export function SeletorMes({ valor, onMudar }: { valor: string; onMudar: (mes: string) => void }) {
  const tema = useTheme();
  return (
    <View style={[styles.caixa, { borderColor: tema.colors.outline }]}>
      <IconButton icon="chevron-left" onPress={() => onMudar(somarMes(valor, -1))} accessibilityLabel="Mês anterior" />
      <Text variant="titleMedium" style={styles.texto}>
        {nomeMes(valor)}
      </Text>
      <IconButton icon="chevron-right" onPress={() => onMudar(somarMes(valor, 1))} accessibilityLabel="Próximo mês" />
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12 },
  texto: { flex: 1, textAlign: "center", fontWeight: "600" },
});
