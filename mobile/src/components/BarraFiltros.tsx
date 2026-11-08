import type { FiltroSituacao } from "@/viewmodels/useListaCrud";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Searchbar, SegmentedButtons, Text, useTheme } from "react-native-paper";

interface Props {
  busca: string;
  onBusca: (texto: string) => void;
  placeholder: string;
  situacao: FiltroSituacao;
  onSituacao: (s: FiltroSituacao) => void;
  exibindo: number;
  total: number;
  rotulo: string; // ex.: "plano(s)"
  extra?: ReactNode; // filtros adicionais (ex.: chips de grupo muscular)
}

// Cabeçalho das listas: busca em tempo real + filtro Ativos/Inativos/Todos + contador.
export function BarraFiltros(p: Props) {
  const tema = useTheme();
  return (
    <View style={styles.filtros}>
      <Searchbar placeholder={p.placeholder} value={p.busca} onChangeText={p.onBusca} style={styles.busca} />
      <SegmentedButtons
        value={p.situacao}
        onValueChange={(v) => p.onSituacao(v as FiltroSituacao)}
        density="small"
        buttons={[
          { value: "ativos", label: "Ativos" },
          { value: "inativos", label: "Inativos" },
          { value: "todos", label: "Todos" },
        ]}
      />
      {p.extra}
      <Text variant="labelMedium" style={{ color: tema.colors.onSurfaceVariant }}>
        {p.exibindo} de {p.total} {p.rotulo}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  filtros: { padding: 16, paddingBottom: 8, gap: 10 },
  busca: { elevation: 0 },
});
