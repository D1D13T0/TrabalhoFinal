import { BarraFiltros } from "@/components/BarraFiltros";
import { ConfirmarExclusao } from "@/components/ConfirmarExclusao";
import type { Plano } from "@/models";
import { marca } from "@/theme";
import { formatarMoeda } from "@/utils/formatacao";
import { usePlanosListaViewModel } from "@/viewmodels/usePlanosViewModel";
import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Avatar, Card, Chip, FAB, IconButton, Text, useTheme } from "react-native-paper";

export default function PlanosScreen() {
  const vm = usePlanosListaViewModel();
  const tema = useTheme();

  function renderPlano({ item }: { item: Plano }) {
    const qtdAlunos = item._count?.alunos ?? 0;
    return (
      <Card mode="elevated" onPress={() => router.push({ pathname: "/plano/[id]", params: { id: item.id } })}>
        <Card.Title
          title={item.nome}
          titleVariant="titleMedium"
          subtitle={`${formatarMoeda(item.valor)} por mês`}
          left={(props) => (
            <Avatar.Text
              {...props}
              label={`${item.diasPorSemana}x`}
              style={{ backgroundColor: tema.colors.primaryContainer }}
              color={tema.colors.onPrimaryContainer}
            />
          )}
          right={() => (
            <IconButton
              icon="trash-can-outline"
              iconColor={tema.colors.error}
              accessibilityLabel={`Excluir ${item.nome}`}
              onPress={() => vm.pedirExclusao(item)}
            />
          )}
        />
        <Card.Content style={styles.tags}>
          <Chip compact icon="account-group" style={styles.chip} textStyle={styles.chipTexto}>
            {qtdAlunos} aluno(s)
          </Chip>
          {!item.ativo && (
            <Chip compact icon="eye-off" style={styles.chip} textStyle={styles.chipTexto}>
              Inativo
            </Chip>
          )}
        </Card.Content>
      </Card>
    );
  }

  const qtdAlunosExcluir = vm.paraExcluir?._count?.alunos ?? 0;

  return (
    <View style={[styles.tela, { backgroundColor: tema.colors.background }]}>
      <BarraFiltros
        busca={vm.busca}
        onBusca={vm.setBusca}
        placeholder="Buscar plano"
        situacao={vm.situacao}
        onSituacao={vm.setSituacao}
        exibindo={vm.filtrados.length}
        total={vm.total}
        rotulo="plano(s)"
      />

      {vm.carregando ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={vm.filtrados}
          keyExtractor={(p) => String(p.id)}
          renderItem={renderPlano}
          contentContainerStyle={styles.lista}
          refreshing={vm.atualizando}
          onRefresh={vm.atualizar}
          ListEmptyComponent={
            <Text style={styles.vazio}>{vm.busca ? "Nenhum plano encontrado." : "Nenhum plano cadastrado."}</Text>
          }
        />
      )}

      <FAB icon="plus" label="Novo plano" style={styles.fab} color={marca.branco} onPress={() => router.push("/plano/novo")} />

      <ConfirmarExclusao
        visivel={!!vm.paraExcluir}
        mensagem={
          qtdAlunosExcluir > 0
            ? `O plano "${vm.paraExcluir?.nome}" tem ${qtdAlunosExcluir} aluno(s). Troque o plano desses alunos ou desative o plano.`
            : `Excluir o plano "${vm.paraExcluir?.nome}"? Essa ação não pode ser desfeita.`
        }
        excluindo={vm.excluindo}
        bloqueado={qtdAlunosExcluir > 0}
        onCancelar={vm.cancelarExclusao}
        onConfirmar={vm.confirmarExclusao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  lista: { paddingHorizontal: 16, paddingBottom: 96, gap: 10 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { height: 28 },
  chipTexto: { fontSize: 12, marginVertical: 0 },
  vazio: { textAlign: "center", marginTop: 32, opacity: 0.7 },
  fab: { position: "absolute", right: 16, bottom: 16, backgroundColor: marca.vermelho },
});
