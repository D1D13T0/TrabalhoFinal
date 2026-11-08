import { BarraFiltros } from "@/components/BarraFiltros";
import { ConfirmarExclusao } from "@/components/ConfirmarExclusao";
import type { Exercicio } from "@/models";
import { urlImagem } from "@/services/api";
import { GRUPOS_MUSCULARES, rotuloGrupo } from "@/services/exercicioService";
import { marca } from "@/theme";
import { useExerciciosListaViewModel } from "@/viewmodels/useExerciciosViewModel";
import { router } from "expo-router";
import { FlatList, Image, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Avatar, Card, Chip, FAB, IconButton, Text, useTheme } from "react-native-paper";

export default function ExerciciosScreen() {
  const vm = useExerciciosListaViewModel();
  const tema = useTheme();

  function renderExercicio({ item }: { item: Exercicio }) {
    const imagem = urlImagem(item.imagem);
    return (
      <Card mode="elevated" onPress={() => router.push({ pathname: "/exercicio/[id]", params: { id: item.id } })}>
        <Card.Title
          title={item.nome}
          titleVariant="titleMedium"
          subtitle={item.descricao ? `${rotuloGrupo(item.grupoMuscular)} • ${item.descricao}` : rotuloGrupo(item.grupoMuscular)}
          subtitleNumberOfLines={1}
          left={() =>
            imagem ? (
              <Image source={{ uri: imagem }} style={styles.miniatura} accessibilityLabel={item.nome} />
            ) : (
              <Avatar.Icon
                size={44}
                icon="dumbbell"
                style={{ backgroundColor: tema.colors.primaryContainer }}
                color={tema.colors.onPrimaryContainer}
              />
            )
          }
          right={() => (
            <IconButton
              icon="trash-can-outline"
              iconColor={tema.colors.error}
              accessibilityLabel={`Excluir ${item.nome}`}
              onPress={() => vm.pedirExclusao(item)}
            />
          )}
        />
        {!item.ativo && (
          <Card.Content style={styles.tags}>
            <Chip compact icon="eye-off" style={styles.chip} textStyle={styles.chipTexto}>
              Inativo
            </Chip>
          </Card.Content>
        )}
      </Card>
    );
  }

  const chipsGrupos = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.grupos}>
      {GRUPOS_MUSCULARES.map((g) => (
        <Chip
          key={g.valor}
          selected={vm.grupo === g.valor}
          showSelectedOverlay
          onPress={() => vm.alternarGrupo(g.valor)}
          mode={vm.grupo === g.valor ? "flat" : "outlined"}
        >
          {g.rotulo}
        </Chip>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.tela, { backgroundColor: tema.colors.background }]}>
      <BarraFiltros
        busca={vm.busca}
        onBusca={vm.setBusca}
        placeholder="Buscar exercício"
        situacao={vm.situacao}
        onSituacao={vm.setSituacao}
        exibindo={vm.filtrados.length}
        total={vm.total}
        rotulo="exercício(s)"
        extra={chipsGrupos}
      />

      {vm.carregando ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={vm.filtrados}
          keyExtractor={(e) => String(e.id)}
          renderItem={renderExercicio}
          contentContainerStyle={styles.lista}
          refreshing={vm.atualizando}
          onRefresh={vm.atualizar}
          ListEmptyComponent={
            <Text style={styles.vazio}>
              {vm.busca || vm.grupo ? "Nenhum exercício encontrado." : "Nenhum exercício cadastrado."}
            </Text>
          }
        />
      )}

      <FAB
        icon="plus"
        label="Novo exercício"
        style={styles.fab}
        color={marca.branco}
        onPress={() => router.push("/exercicio/novo")}
      />

      <ConfirmarExclusao
        visivel={!!vm.paraExcluir}
        mensagem={`Excluir o exercício "${vm.paraExcluir?.nome}"? Se ele estiver em algum treino, a exclusão será bloqueada (nesse caso, desative-o).`}
        excluindo={vm.excluindo}
        onCancelar={vm.cancelarExclusao}
        onConfirmar={vm.confirmarExclusao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  grupos: { gap: 8 },
  lista: { paddingHorizontal: 16, paddingBottom: 96, gap: 10 },
  miniatura: { width: 44, height: 44, borderRadius: 8 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { height: 28 },
  chipTexto: { fontSize: 12, marginVertical: 0 },
  vazio: { textAlign: "center", marginTop: 32, opacity: 0.7 },
  fab: { position: "absolute", right: 16, bottom: 16, backgroundColor: marca.vermelho },
});
