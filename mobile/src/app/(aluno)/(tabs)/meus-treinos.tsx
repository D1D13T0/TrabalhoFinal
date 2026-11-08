import { AvisoMensalidade } from "@/components/AvisoMensalidade";
import { useAuth } from "@/contexts/AuthContext";
import type { TreinoLocal } from "@/database/TreinoLocalDAO";
import { marca } from "@/theme";
import { useMeusTreinosViewModel } from "@/viewmodels/useMeusTreinosViewModel";
import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Avatar, Card, Icon, Surface, Text, useTheme } from "react-native-paper";

function formatarSincronizacao(iso: string | null) {
  if (!iso) return "nunca";
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function MeusTreinosScreen() {
  const vm = useMeusTreinosViewModel();
  const { usuario } = useAuth();
  const tema = useTheme();
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

  function renderTreino({ item }: { item: TreinoLocal }) {
    const letra = /treino\s+([a-z])\b/i.exec(item.nome)?.[1]?.toUpperCase() ?? item.nome[0]?.toUpperCase() ?? "T";
    return (
      <Card mode="elevated" onPress={() => router.push({ pathname: "/meu-treino/[id]", params: { id: item.id } })}>
        <Card.Title
          title={item.nome}
          titleVariant="titleMedium"
          titleNumberOfLines={2}
          subtitle={`${item.totalItens} exercício(s)${item.observacoes ? " • " + item.observacoes : ""}`}
          subtitleNumberOfLines={1}
          left={(props) => <Avatar.Text {...props} label={letra} style={{ backgroundColor: marca.vermelho }} color={marca.branco} />}
          right={() => <Icon source="chevron-right" size={24} color={tema.colors.onSurfaceVariant} />}
          rightStyle={{ marginRight: 12 }}
        />
      </Card>
    );
  }

  const cabecalho = (
    <View style={styles.cabecalho}>
      <AvisoMensalidade mensalidade={vm.mensalidade} onVerDetalhes={() => router.push("/mensalidade")} />

      <Surface style={[styles.boasVindas, { backgroundColor: tema.dark ? tema.colors.surface : marca.azul }]} elevation={2}>
        <View style={{ flex: 1 }}>
          <Text variant="titleLarge" style={styles.textoClaro}>
            Olá, {primeiroNome}! 💪
          </Text>
          <Text variant="bodyMedium" style={styles.textoClaroSuave}>
            Você treinou {vm.diasNaSemana} dia(s) nos últimos 7 dias.
          </Text>
        </View>
        <Icon source="arm-flex" size={40} color={marca.branco} />
      </Surface>

      <View style={styles.status}>
        <Icon
          source={vm.offline ? "cloud-off-outline" : "cloud-check-outline"}
          size={16}
          color={vm.offline ? tema.colors.error : tema.colors.onSurfaceVariant}
        />
        <Text variant="labelSmall" style={{ color: vm.offline ? tema.colors.error : tema.colors.onSurfaceVariant }}>
          {vm.offline
            ? `Sem conexão — mostrando cópia salva (${formatarSincronizacao(vm.ultimaSincronizacao)})`
            : `Sincronizado em ${formatarSincronizacao(vm.ultimaSincronizacao)}`}
        </Text>
      </View>
    </View>
  );

  if (vm.carregando) return <ActivityIndicator style={{ marginTop: 48 }} />;

  return (
    <FlatList
      style={{ backgroundColor: tema.colors.background }}
      data={vm.treinos}
      keyExtractor={(t) => String(t.id)}
      renderItem={renderTreino}
      ListHeaderComponent={cabecalho}
      contentContainerStyle={styles.lista}
      refreshing={vm.atualizando}
      onRefresh={vm.atualizar}
      ListEmptyComponent={
        <View style={styles.vazio}>
          <Icon source="clipboard-text-outline" size={48} color={tema.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={{ textAlign: "center", color: tema.colors.onSurfaceVariant }}>
            {vm.offline
              ? "Sem conexão e nenhum treino salvo neste celular ainda."
              : "Você ainda não tem treinos. Fale com seu professor!"}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16, gap: 10, maxWidth: 720, width: "100%", alignSelf: "center" },
  cabecalho: { gap: 12, marginBottom: 4 },
  boasVindas: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  textoClaro: { color: marca.branco, fontWeight: "700" },
  textoClaroSuave: { color: "#D3E4F5" },
  status: { flexDirection: "row", alignItems: "center", gap: 6 },
  vazio: { alignItems: "center", gap: 8, marginTop: 32, paddingHorizontal: 24 },
});
