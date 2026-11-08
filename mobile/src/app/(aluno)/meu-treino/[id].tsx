import type { TreinoItemLocal } from "@/database/TreinoLocalDAO";
import { urlImagem } from "@/services/api";
import { rotuloGrupo } from "@/services/exercicioService";
import { marca, statusCores } from "@/theme";
import { useExecucaoTreinoViewModel } from "@/viewmodels/useExecucaoTreinoViewModel";
import { Stack, useLocalSearchParams } from "expo-router";
import { FlatList, Image, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  Icon,
  Portal,
  ProgressBar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

export default function ExecucaoTreinoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useExecucaoTreinoViewModel(Number(id));
  const tema = useTheme();

  if (vm.carregando) return <ActivityIndicator style={{ marginTop: 48 }} />;

  if (!vm.treino) {
    return (
      <View style={[styles.vazio, { backgroundColor: tema.colors.background }]}>
        <Icon source="alert-circle-outline" size={48} color={tema.colors.onSurfaceVariant} />
        <Text>Treino não encontrado neste celular.</Text>
      </View>
    );
  }

  const completo = vm.total > 0 && vm.feitos === vm.total;

  function renderItem({ item, index }: { item: TreinoItemLocal; index: number }) {
    const feito = vm.concluidos.has(item.id);
    const imagem = urlImagem(item.imagem);
    return (
      <Card mode="elevated" onPress={() => vm.alternar(item)} style={feito ? { opacity: 0.75 } : undefined}>
        <Card.Content style={styles.item}>
          {imagem ? (
            <Image source={{ uri: imagem }} style={styles.imagem} accessibilityLabel={item.exercicioNome} />
          ) : (
            <Avatar.Text size={52} label={String(index + 1)} style={{ backgroundColor: tema.colors.primaryContainer }} color={tema.colors.onPrimaryContainer} />
          )}
          <View style={styles.itemTexto}>
            <Text variant="titleMedium" style={[{ fontWeight: "700" }, feito && styles.riscado]}>
              {item.exercicioNome}
            </Text>
            <Text variant="bodySmall" style={{ color: tema.colors.onSurfaceVariant }}>
              {rotuloGrupo(item.grupoMuscular)}
            </Text>
            {/* Grid de informações */}
            <View style={styles.chips}>
              <Chip compact icon="repeat" style={styles.chip} textStyle={styles.chipTexto}>
                {item.series} x {item.repeticoes}
              </Chip>
              {item.carga !== null && (
                <Chip compact icon="weight-kilogram" style={styles.chip} textStyle={styles.chipTexto}>
                  {String(item.carga).replace(".", ",")} kg
                </Chip>
              )}
              {item.descansoSegundos !== null && (
                <Chip compact icon="timer-outline" style={styles.chip} textStyle={styles.chipTexto}>
                  {item.descansoSegundos}s
                </Chip>
              )}
            </View>
            {item.exercicioDescricao ? (
              <Text variant="bodySmall" style={{ color: tema.colors.onSurfaceVariant, marginTop: 4 }}>
                {item.exercicioDescricao}
              </Text>
            ) : null}
          </View>
          <Checkbox
            status={feito ? "checked" : "unchecked"}
            onPress={() => vm.alternar(item)}
            color={statusCores.sucesso}
          />
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: tema.colors.background }}>
      <Stack.Screen options={{ title: vm.treino.nome }} />
      <FlatList
        data={vm.treino.itens}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <Surface style={styles.progresso} elevation={1}>
            <View style={styles.progressoTopo}>
              <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                {completo ? "Treino concluído! 🎉" : "Progresso de hoje"}
              </Text>
              <Text variant="titleMedium" style={{ color: completo ? statusCores.sucesso : tema.colors.primary, fontWeight: "700" }}>
                {vm.feitos}/{vm.total}
              </Text>
            </View>
            {/* Altura fixa: na web o ProgressBar do Paper usa flex: 1 e cresceria sem esse contêiner. */}
            <View style={styles.barraContainer}>
              <ProgressBar progress={vm.progresso} color={completo ? statusCores.sucesso : marca.vermelho} style={styles.barra} />
            </View>
            {vm.treino.observacoes ? (
              <Text variant="bodyMedium" style={{ marginTop: 10 }}>
                📝 {vm.treino.observacoes}
              </Text>
            ) : null}
            <Text variant="labelSmall" style={{ color: tema.colors.onSurfaceVariant, marginTop: 8 }}>
              Toque no exercício para marcar como feito. Fica salvo no celular, mesmo sem internet.
            </Text>
          </Surface>
        }
        ListFooterComponent={
          vm.feitos > 0 ? (
            <Button icon="restart" mode="text" onPress={vm.pedirReinicio} style={{ marginTop: 8 }}>
              Recomeçar marcações de hoje
            </Button>
          ) : undefined
        }
      />

      <Portal>
        <Dialog visible={vm.confirmarReinicio} onDismiss={vm.cancelarReinicio}>
          <Dialog.Title>Recomeçar?</Dialog.Title>
          <Dialog.Content>
            <Text>As marcações de hoje deste treino serão apagadas.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {[
              <Button key="cancelar" onPress={vm.cancelarReinicio}>
                Cancelar
              </Button>,
              <Button key="ok" mode="contained" onPress={vm.reiniciar}>
                Recomeçar
              </Button>,
            ]}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16, gap: 10, maxWidth: 720, width: "100%", alignSelf: "center" },
  progresso: { borderRadius: 16, padding: 16, marginBottom: 4 },
  progressoTopo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  barraContainer: { height: 10 },
  barra: { height: 10, borderRadius: 5 },
  item: { flexDirection: "row", alignItems: "center", gap: 12 },
  imagem: { width: 52, height: 52, borderRadius: 10 },
  itemTexto: { flex: 1 },
  riscado: { textDecorationLine: "line-through" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: { height: 28 },
  chipTexto: { fontSize: 12, marginVertical: 0 },
  vazio: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
});
