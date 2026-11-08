import type { FormaPagamento, Pagamento, StatusMensalidade } from "@/models";
import { statusCores } from "@/theme";
import { formatarMoeda, isoParaBr, nomeMes } from "@/utils/formatacao";
import { useMensalidadeViewModel } from "@/viewmodels/useMensalidadeViewModel";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Chip, Icon, List, Surface, Text, useTheme } from "react-native-paper";

const STATUS: Record<StatusMensalidade, { titulo: string; cor: string; icone: string }> = {
  PAGA: { titulo: "Mensalidade paga", cor: statusCores.sucesso, icone: "check-circle" },
  EM_ABERTO: { titulo: "Em aberto", cor: "#4A5568", icone: "calendar-clock" },
  A_VENCER: { titulo: "Vence em breve", cor: statusCores.aviso, icone: "calendar-alert" },
  ATRASADA: { titulo: "Mensalidade atrasada", cor: statusCores.erro, icone: "alert-circle" },
};

const FORMAS: Record<FormaPagamento, string> = { PIX: "Pix", CARTAO: "Cartão", DINHEIRO: "Dinheiro" };


export default function MensalidadeScreen() {
  const vm = useMensalidadeViewModel();
  const tema = useTheme();

  if (vm.carregando) return <ActivityIndicator style={{ marginTop: 48 }} />;

  const m = vm.mensalidade;
  const status = m ? STATUS[m.status] : null;

  const cabecalho = (
    <View style={{ gap: 12 }}>
      {vm.offline && (
        <View style={styles.offline}>
          <Icon source="cloud-off-outline" size={16} color={tema.colors.error} />
          <Text variant="labelSmall" style={{ color: tema.colors.error }}>
            Sem conexão — mostrando a última informação salva.
          </Text>
        </View>
      )}

      {m && status ? (
        <Surface style={[styles.cartao, { borderLeftColor: status.cor }]} elevation={2}>
          <View style={styles.cartaoTopo}>
            <Icon source={status.icone} size={32} color={status.cor} />
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: "700", color: status.cor }}>
                {status.titulo}
              </Text>
              <Text variant="bodyMedium">{nomeMes(m.mesReferencia)}</Text>
            </View>
          </View>
          {/* Grid de 2 colunas */}
          <View style={styles.grade}>
            <View style={styles.celula}>
              <Text variant="labelMedium" style={{ color: tema.colors.onSurfaceVariant }}>
                Valor
              </Text>
              <Text variant="headlineSmall" style={{ fontWeight: "700" }}>
                {formatarMoeda(m.valor)}
              </Text>
            </View>
            <View style={styles.celula}>
              <Text variant="labelMedium" style={{ color: tema.colors.onSurfaceVariant }}>
                Vencimento
              </Text>
              <Text variant="headlineSmall" style={{ fontWeight: "700" }}>
                {isoParaBr(m.vencimento).slice(0, 5)}
              </Text>
            </View>
          </View>
          {m.status === "ATRASADA" && (
            <Text style={{ color: status.cor, marginTop: 8 }}>
              {Math.abs(m.diasParaVencer)} dia(s) de atraso. Procure a recepção para regularizar.
            </Text>
          )}
          {m.status === "A_VENCER" && (
            <Text style={{ color: status.cor, marginTop: 8 }}>
              {m.diasParaVencer === 0 ? "Vence hoje!" : `Faltam ${m.diasParaVencer} dia(s).`}
            </Text>
          )}
        </Surface>
      ) : (
        <Text>Não foi possível carregar a mensalidade.</Text>
      )}

      <Text variant="titleSmall" style={[styles.titulo, { color: tema.colors.primary }]}>
        Histórico de pagamentos
      </Text>
    </View>
  );

  function renderPagamento({ item }: { item: Pagamento }) {
    return (
      <Surface style={styles.pagamento} elevation={1}>
        <List.Item
          title={nomeMes(item.mesReferencia)}
          description={item.pago ? `Pago em ${isoParaBr(item.dataPagamento)} • ${FORMAS[item.formaPagamento]}` : "Aguardando pagamento"}
          left={(props) => (
            <List.Icon {...props} icon={item.pago ? "check-circle" : "clock-outline"} color={item.pago ? statusCores.sucesso : statusCores.aviso} />
          )}
          right={() => (
            <View style={styles.direita}>
              <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                {formatarMoeda(item.valor)}
              </Text>
              <Chip compact style={styles.chip} textStyle={styles.chipTexto}>
                {item.pago ? "Pago" : "Pendente"}
              </Chip>
            </View>
          )}
        />
      </Surface>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: tema.colors.background }}
      data={vm.pagamentos}
      keyExtractor={(p) => String(p.id)}
      renderItem={renderPagamento}
      ListHeaderComponent={cabecalho}
      contentContainerStyle={styles.lista}
      refreshing={vm.atualizando}
      onRefresh={vm.atualizar}
      ListEmptyComponent={<Text style={styles.vazio}>Nenhum pagamento registrado ainda.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16, gap: 10, maxWidth: 720, width: "100%", alignSelf: "center" },
  offline: { flexDirection: "row", alignItems: "center", gap: 6 },
  cartao: { borderRadius: 16, padding: 16, borderLeftWidth: 6 },
  cartaoTopo: { flexDirection: "row", alignItems: "center", gap: 12 },
  grade: { flexDirection: "row", marginTop: 16 },
  celula: { flex: 1 },
  titulo: { fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 8 },
  pagamento: { borderRadius: 12 },
  direita: { alignItems: "flex-end", justifyContent: "center", gap: 4 },
  chip: { height: 24 },
  chipTexto: { fontSize: 11, marginVertical: 0 },
  vazio: { textAlign: "center", marginTop: 16, opacity: 0.7 },
});
