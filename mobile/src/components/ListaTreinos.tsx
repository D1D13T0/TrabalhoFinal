import type { Treino } from "@/models";
import { marca } from "@/theme";
import { useTreinosListaViewModel } from "@/viewmodels/useTreinosListaViewModel";
import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Avatar, Card, Chip, FAB, IconButton, Text, useTheme } from "react-native-paper";
import { BarraFiltros } from "./BarraFiltros";
import { ConfirmarExclusao } from "./ConfirmarExclusao";

// Lista de fichas de treino. Usada no menu "Treinos" (todos) e a partir de um aluno (alunoId).
export function ListaTreinos({ alunoId }: { alunoId?: number }) {
  const vm = useTreinosListaViewModel(alunoId);
  const tema = useTheme();

  function abrir(t: Treino) {
    router.push({ pathname: "/treino/[id]", params: { id: t.id } });
  }

  function renderTreino({ item }: { item: Treino }) {
    const letra = /treino\s+([a-z])\b/i.exec(item.nome)?.[1]?.toUpperCase() ?? item.nome[0]?.toUpperCase() ?? "T";
    return (
      <Card mode="elevated" onPress={() => abrir(item)}>
        <Card.Title
          title={item.nome}
          titleVariant="titleMedium"
          titleNumberOfLines={2}
          subtitle={alunoId ? `${item.itens.length} exercício(s)` : `${item.aluno.usuario.nome} • ${item.itens.length} exercício(s)`}
          left={(props) => (
            <Avatar.Text {...props} label={letra} style={{ backgroundColor: marca.vermelho }} color={marca.branco} />
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
          {item.itens.slice(0, 4).map((i) => (
            <Chip key={i.id} compact style={styles.chip} textStyle={styles.chipTexto}>
              {i.exercicio.nome}
            </Chip>
          ))}
          {item.itens.length > 4 && (
            <Chip compact style={styles.chip} textStyle={styles.chipTexto}>
              +{item.itens.length - 4}
            </Chip>
          )}
          {!item.ativo && (
            <Chip compact icon="eye-off" style={styles.chip} textStyle={styles.chipTexto}>
              Inativo
            </Chip>
          )}
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={[styles.tela, { backgroundColor: tema.colors.background }]}>
      <BarraFiltros
        busca={vm.busca}
        onBusca={vm.setBusca}
        placeholder={alunoId ? "Buscar treino ou exercício" : "Buscar por treino, aluno ou exercício"}
        situacao={vm.situacao}
        onSituacao={vm.setSituacao}
        exibindo={vm.filtrados.length}
        total={vm.total}
        rotulo="treino(s)"
      />

      {vm.carregando ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={vm.filtrados}
          keyExtractor={(t) => String(t.id)}
          renderItem={renderTreino}
          contentContainerStyle={styles.lista}
          refreshing={vm.atualizando}
          onRefresh={vm.atualizar}
          ListEmptyComponent={
            <Text style={styles.vazio}>{vm.busca ? "Nenhum treino encontrado." : "Nenhum treino montado ainda."}</Text>
          }
        />
      )}

      <FAB
        icon="plus"
        label="Novo treino"
        style={styles.fab}
        color={marca.branco}
        onPress={() =>
          router.push(alunoId ? { pathname: "/treino/novo", params: { alunoId } } : "/treino/novo")
        }
      />

      <ConfirmarExclusao
        visivel={!!vm.paraExcluir}
        mensagem={`Excluir "${vm.paraExcluir?.nome}" de ${vm.paraExcluir?.aluno.usuario.nome}? Essa ação não pode ser desfeita.`}
        excluindo={vm.excluindo}
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
