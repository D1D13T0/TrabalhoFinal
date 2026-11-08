import { AvatarAluno } from "@/components/AvatarAluno";
import { ConfirmarExclusao } from "@/components/ConfirmarExclusao";
import type { Aluno } from "@/models";
import { marca } from "@/theme";
import { useAlunosListaViewModel, type FiltroSituacao } from "@/viewmodels/useAlunosListaViewModel";
import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Chip, FAB, IconButton, Searchbar, SegmentedButtons, Text, useTheme } from "react-native-paper";

export default function AlunosScreen() {
  const vm = useAlunosListaViewModel();
  const tema = useTheme();

  function renderAluno({ item }: { item: Aluno }) {
    return (
      <Card style={styles.card} mode="elevated" onPress={() => router.push({ pathname: "/aluno/[id]", params: { id: item.id } })}>
        <Card.Title
          title={item.usuario.nome}
          titleVariant="titleMedium"
          subtitle={`${item.plano.nome} • ${item.diasTreino.join(", ")}`}
          left={() => <AvatarAluno nome={item.usuario.nome} foto={item.foto} tamanho={44} />}
          right={() => (
            <IconButton
              icon="trash-can-outline"
              iconColor={tema.colors.error}
              accessibilityLabel={`Excluir ${item.usuario.nome}`}
              onPress={() => vm.pedirExclusao(item)}
            />
          )}
        />
        <Card.Content style={styles.tags}>
          <Chip compact icon="phone" style={styles.chip} textStyle={styles.chipTexto}>
            {item.telefone}
          </Chip>
          {!item.ativo && (
            <Chip compact icon="account-off" style={styles.chip} textStyle={styles.chipTexto}>
              Inativo
            </Chip>
          )}
          {item.possuiRestricaoMedica && (
            <Chip compact icon="medical-bag" style={[styles.chip, { backgroundColor: tema.colors.errorContainer }]} textStyle={[styles.chipTexto, { color: tema.colors.onErrorContainer }]}>
              Restrição médica
            </Chip>
          )}
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={[styles.tela, { backgroundColor: tema.colors.background }]}>
      <View style={styles.filtros}>
        <Searchbar
          placeholder="Buscar por nome, e-mail, telefone ou plano"
          value={vm.busca}
          onChangeText={vm.setBusca}
          style={styles.busca}
        />
        <SegmentedButtons
          value={vm.situacao}
          onValueChange={(v) => vm.setSituacao(v as FiltroSituacao)}
          density="small"
          buttons={[
            { value: "ativos", label: "Ativos" },
            { value: "inativos", label: "Inativos" },
            { value: "todos", label: "Todos" },
          ]}
        />
        <Text variant="labelMedium" style={{ color: tema.colors.onSurfaceVariant }}>
          {vm.filtrados.length} de {vm.total} aluno(s)
        </Text>
      </View>

      {vm.carregando ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={vm.filtrados}
          keyExtractor={(a) => String(a.id)}
          renderItem={renderAluno}
          contentContainerStyle={styles.lista}
          refreshing={vm.atualizando}
          onRefresh={vm.atualizar}
          ListEmptyComponent={
            <Text style={styles.vazio} variant="bodyMedium">
              {vm.busca ? "Nenhum aluno encontrado para essa busca." : "Nenhum aluno cadastrado ainda."}
            </Text>
          }
        />
      )}

      <FAB
        icon="plus"
        label="Novo aluno"
        style={styles.fab}
        color={marca.branco}
        onPress={() => router.push("/aluno/novo")}
      />

      <ConfirmarExclusao
        visivel={!!vm.paraExcluir}
        mensagem={`Excluir ${vm.paraExcluir?.usuario.nome}? Os treinos e pagamentos desse aluno também serão apagados. Essa ação não pode ser desfeita.`}
        excluindo={vm.excluindo}
        onCancelar={vm.cancelarExclusao}
        onConfirmar={vm.confirmarExclusao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  filtros: { padding: 16, paddingBottom: 8, gap: 10 },
  busca: { elevation: 0 },
  lista: { paddingHorizontal: 16, paddingBottom: 96, gap: 10 },
  card: {},
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { height: 28 },
  chipTexto: { fontSize: 12, marginVertical: 0 },
  vazio: { textAlign: "center", marginTop: 32, opacity: 0.7 },
  fab: { position: "absolute", right: 16, bottom: 16, backgroundColor: marca.vermelho },
});
