import { ConfirmarExclusao } from "@/components/ConfirmarExclusao";
import { SeletorMes } from "@/components/SeletorMes";
import type { Pagamento } from "@/models";
import { FORMAS_PAGAMENTO } from "@/services/pagamentoService";
import { marca, statusCores } from "@/theme";
import { formatarMoeda, isoParaBr, nomeMes } from "@/utils/formatacao";
import { usePagamentosListaViewModel, type FiltroPago } from "@/viewmodels/usePagamentosListaViewModel";
import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, FAB, IconButton, List, Searchbar, SegmentedButtons, Surface, Text, useTheme } from "react-native-paper";

export default function PagamentosScreen() {
  const vm = usePagamentosListaViewModel();
  const tema = useTheme();

  function renderPagamento({ item }: { item: Pagamento }) {
    const forma = FORMAS_PAGAMENTO.find((f) => f.valor === item.formaPagamento);
    return (
      <Card mode="elevated" onPress={() => router.push({ pathname: "/pagamento/[id]", params: { id: item.id } })}>
        <List.Item
          title={item.aluno.usuario.nome}
          description={item.pago ? `Pago em ${isoParaBr(item.dataPagamento)} • ${forma?.rotulo}` : `Pendente • ${forma?.rotulo}`}
          left={(p) => (
            <List.Icon {...p} icon={item.pago ? "check-circle" : "clock-outline"} color={item.pago ? statusCores.sucesso : statusCores.aviso} />
          )}
          right={() => (
            <View style={styles.direita}>
              <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                {formatarMoeda(item.valor)}
              </Text>
              <IconButton
                icon="trash-can-outline"
                size={20}
                iconColor={tema.colors.error}
                accessibilityLabel={`Excluir pagamento de ${item.aluno.usuario.nome}`}
                onPress={() => vm.pedirExclusao(item)}
              />
            </View>
          )}
        />
      </Card>
    );
  }

  const cabecalho = (
    <View style={styles.filtros}>
      <SeletorMes valor={vm.mes} onMudar={vm.setMes} />

      {/* Grid com os totais do mês */}
      <View style={styles.totais}>
        <Surface style={[styles.total, { borderLeftColor: statusCores.sucesso }]} elevation={1}>
          <Text variant="labelMedium" style={{ color: tema.colors.onSurfaceVariant }}>
            Recebido
          </Text>
          <Text variant="titleLarge" style={{ fontWeight: "700", color: statusCores.sucesso }}>
            {formatarMoeda(vm.totais.recebido)}
          </Text>
        </Surface>
        <Surface style={[styles.total, { borderLeftColor: statusCores.aviso }]} elevation={1}>
          <Text variant="labelMedium" style={{ color: tema.colors.onSurfaceVariant }}>
            Pendente
          </Text>
          <Text variant="titleLarge" style={{ fontWeight: "700", color: statusCores.aviso }}>
            {formatarMoeda(vm.totais.pendente)}
          </Text>
        </Surface>
      </View>

      <Searchbar placeholder="Buscar por aluno" value={vm.busca} onChangeText={vm.setBusca} style={{ elevation: 0 }} />
      <SegmentedButtons
        value={vm.filtroPago}
        onValueChange={(v) => vm.setFiltroPago(v as FiltroPago)}
        density="small"
        buttons={[
          { value: "todos", label: "Todos" },
          { value: "pagos", label: "Pagos" },
          { value: "pendentes", label: "Pendentes" },
        ]}
      />
      <Text variant="labelMedium" style={{ color: tema.colors.onSurfaceVariant }}>
        {vm.filtrados.length} de {vm.total} pagamento(s)
      </Text>
    </View>
  );

  return (
    <View style={[styles.tela, { backgroundColor: tema.colors.background }]}>
      <FlatList
        data={vm.carregando ? [] : vm.filtrados}
        keyExtractor={(p) => String(p.id)}
        renderItem={renderPagamento}
        ListHeaderComponent={cabecalho}
        contentContainerStyle={styles.lista}
        refreshing={vm.atualizando}
        onRefresh={vm.atualizar}
        ListEmptyComponent={
          vm.carregando ? (
            <ActivityIndicator style={{ marginTop: 32 }} />
          ) : (
            <Text style={styles.vazio}>
              {vm.busca ? "Nenhum pagamento encontrado." : `Nenhum pagamento registrado em ${nomeMes(vm.mes)}.`}
            </Text>
          )
        }
      />

      <FAB
        icon="plus"
        label="Registrar"
        style={styles.fab}
        color={marca.branco}
        onPress={() => router.push({ pathname: "/pagamento/novo", params: { mes: vm.mes } })}
      />

      <ConfirmarExclusao
        visivel={!!vm.paraExcluir}
        mensagem={`Excluir o pagamento de ${vm.paraExcluir?.aluno.usuario.nome} (${vm.paraExcluir ? nomeMes(vm.paraExcluir.mesReferencia) : ""})? Essa ação não pode ser desfeita.`}
        excluindo={vm.excluindo}
        onCancelar={vm.cancelarExclusao}
        onConfirmar={vm.confirmarExclusao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  filtros: { gap: 10, marginBottom: 4 },
  totais: { flexDirection: "row", gap: 10 },
  total: { flex: 1, borderRadius: 12, padding: 12, borderLeftWidth: 5 },
  lista: { padding: 16, paddingBottom: 96, gap: 10, maxWidth: 720, width: "100%", alignSelf: "center" },
  direita: { flexDirection: "row", alignItems: "center" },
  vazio: { textAlign: "center", marginTop: 32, opacity: 0.7 },
  fab: { position: "absolute", right: 16, bottom: 16, backgroundColor: marca.vermelho },
});
