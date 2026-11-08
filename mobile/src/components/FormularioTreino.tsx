import { rotuloGrupo } from "@/services/exercicioService";
import { marca } from "@/theme";
import { useTreinoFormViewModel, type ItemForm } from "@/viewmodels/useTreinoFormViewModel";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Checkbox,
  HelperText,
  IconButton,
  List,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { AvatarAluno } from "./AvatarAluno";
import { ConfirmarExclusao } from "./ConfirmarExclusao";
import { SeletorAluno } from "./SeletorAluno";

type Vm = ReturnType<typeof useTreinoFormViewModel>;

// Cartão de um exercício da ficha: ordem, ações e grade de séries/repetições/carga/descanso.
function CartaoItem({ item, indice, total, vm }: { item: ItemForm; indice: number; total: number; vm: Vm }) {
  const tema = useTheme();
  const erros = vm.erros.porItem[item.chave] ?? {};

  return (
    <Surface style={styles.item} elevation={1}>
      <View style={styles.itemTopo}>
        <Avatar.Text size={32} label={String(indice + 1)} style={{ backgroundColor: tema.colors.primary }} color={tema.colors.onPrimary} />
        <View style={styles.itemTitulo}>
          <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: "700" }}>
            {item.exercicio.nome}
          </Text>
          <Text variant="bodySmall" style={{ color: tema.colors.onSurfaceVariant }}>
            {rotuloGrupo(item.exercicio.grupoMuscular)}
          </Text>
        </View>
        <IconButton icon="arrow-up" size={20} disabled={indice === 0} onPress={() => vm.moverItem(item.chave, -1)} accessibilityLabel="Mover para cima" />
        <IconButton icon="arrow-down" size={20} disabled={indice === total - 1} onPress={() => vm.moverItem(item.chave, 1)} accessibilityLabel="Mover para baixo" />
        <IconButton icon="close" size={20} iconColor={tema.colors.error} onPress={() => vm.removerItem(item.chave)} accessibilityLabel={`Remover ${item.exercicio.nome}`} />
      </View>

      {/* Grid 2x2 */}
      <View style={styles.grade}>
        <View style={styles.celula}>
          <TextInput dense mode="outlined" label="Séries *" value={item.series} keyboardType="number-pad" onChangeText={(t) => vm.alterarItem(item.chave, "series", t)} error={!!erros.series} />
          <HelperText type="error" visible={!!erros.series} style={styles.ajuda}>
            {erros.series}
          </HelperText>
        </View>
        <View style={styles.celula}>
          <TextInput dense mode="outlined" label="Repetições *" value={item.repeticoes} placeholder="12 ou 10-12" onChangeText={(t) => vm.alterarItem(item.chave, "repeticoes", t)} error={!!erros.repeticoes} />
          <HelperText type="error" visible={!!erros.repeticoes} style={styles.ajuda}>
            {erros.repeticoes}
          </HelperText>
        </View>
        <View style={styles.celula}>
          <TextInput dense mode="outlined" label="Carga" value={item.carga} keyboardType="decimal-pad" right={<TextInput.Affix text="kg" />} onChangeText={(t) => vm.alterarItem(item.chave, "carga", t)} error={!!erros.carga} />
          <HelperText type="error" visible={!!erros.carga} style={styles.ajuda}>
            {erros.carga}
          </HelperText>
        </View>
        <View style={styles.celula}>
          <TextInput dense mode="outlined" label="Descanso" value={item.descanso} keyboardType="number-pad" right={<TextInput.Affix text="s" />} onChangeText={(t) => vm.alterarItem(item.chave, "descanso", t)} />
        </View>
      </View>
    </Surface>
  );
}

// Formulário da ficha de treino (novo ou edição).
export function FormularioTreino({ treinoId, alunoId }: { treinoId?: number; alunoId?: number }) {
  const vm = useTreinoFormViewModel(treinoId, alunoId);
  const tema = useTheme();

  if (vm.carregando) return <ActivityIndicator style={{ marginTop: 48 }} />;

  const aluno = vm.alunoSelecionado;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={{ backgroundColor: tema.colors.background }} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Surface style={styles.secao} elevation={1}>
          <Text variant="titleSmall" style={[styles.tituloSecao, { color: tema.colors.primary }]}>
            Ficha
          </Text>

          <List.Item
            title={aluno ? aluno.usuario.nome : "Selecionar aluno *"}
            description={aluno ? `${aluno.plano.nome} • treina ${aluno.diasTreino.join(", ")}` : "Toque para escolher"}
            onPress={vm.abrirSeletorAluno}
            left={() => (aluno ? <AvatarAluno nome={aluno.usuario.nome} foto={aluno.foto} tamanho={40} /> : <List.Icon icon="account-search" />)}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            style={[styles.seletor, { borderColor: vm.erros.aluno ? tema.colors.error : tema.colors.outline }]}
          />
          <HelperText type="error" visible={!!vm.erros.aluno}>
            {vm.erros.aluno}
          </HelperText>
          {aluno?.possuiRestricaoMedica && (
            <Surface style={[styles.alerta, { backgroundColor: tema.colors.errorContainer }]} elevation={0}>
              <Text style={{ color: tema.colors.onErrorContainer }}>⚠ Restrição médica: {aluno.observacoes || "ver cadastro"}</Text>
            </Surface>
          )}

          <TextInput label="Nome do treino *" mode="outlined" value={vm.nome} onChangeText={vm.alterarNome} placeholder="Treino A - Peito e Tríceps" error={!!vm.erros.nome} />
          <HelperText type="error" visible={!!vm.erros.nome}>
            {vm.erros.nome}
          </HelperText>

          <TextInput label="Observações para o aluno" mode="outlined" multiline numberOfLines={2} value={vm.observacoes} onChangeText={vm.setObservacoes} placeholder="Ex.: aquecer 10 min na esteira antes" />

          <Checkbox.Item
            label="Treino ativo (visível para o aluno)"
            status={vm.ativo ? "checked" : "unchecked"}
            onPress={vm.alternarAtivo}
            position="leading"
            style={styles.check}
            labelStyle={styles.rotuloEsquerda}
          />
        </Surface>

        <View style={styles.cabecalhoItens}>
          <Text variant="titleSmall" style={[styles.tituloSecao, { color: tema.colors.primary, marginBottom: 0 }]}>
            Exercícios ({vm.itens.length})
          </Text>
        </View>

        {vm.itens.map((item, indice) => (
          <CartaoItem key={item.chave} item={item} indice={indice} total={vm.itens.length} vm={vm} />
        ))}

        <Button mode="outlined" icon="plus" onPress={vm.adicionarExercicio} style={styles.adicionar}>
          Adicionar exercício
        </Button>
        <HelperText type="error" visible={!!vm.erros.itens}>
          {vm.erros.itens}
        </HelperText>

        <Button mode="contained" icon="content-save" onPress={vm.salvar} loading={vm.salvando} disabled={vm.salvando} buttonColor={marca.vermelho} textColor={marca.branco} contentStyle={styles.botao}>
          {vm.editando ? "Salvar alterações" : "Criar treino"}
        </Button>

        {vm.editando && (
          <Button mode="outlined" icon="trash-can-outline" textColor={tema.colors.error} onPress={vm.pedirExclusao}>
            Excluir treino
          </Button>
        )}
      </ScrollView>

      <SeletorAluno
        visivel={vm.seletorAlunoAberto}
        alunos={vm.alunos}
        selecionadoId={aluno?.id ?? null}
        onEscolher={vm.escolherAluno}
        onFechar={vm.fecharSeletorAluno}
      />

      <ConfirmarExclusao
        visivel={vm.confirmarExclusao}
        mensagem={`Excluir "${vm.nome}"? O aluno deixará de ver esse treino. Essa ação não pode ser desfeita.`}
        excluindo={vm.excluindo}
        onCancelar={vm.cancelarExclusao}
        onConfirmar={vm.excluir}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 12, paddingBottom: 40, maxWidth: 720, width: "100%", alignSelf: "center" },
  secao: { borderRadius: 16, padding: 16 },
  tituloSecao: { fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  seletor: { borderWidth: 1, borderRadius: 12, paddingLeft: 8 },
  alerta: { borderRadius: 12, padding: 12, marginBottom: 12 },
  check: { paddingHorizontal: 0 },
  rotuloEsquerda: { textAlign: "left" },
  cabecalhoItens: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  item: { borderRadius: 16, padding: 12 },
  itemTopo: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemTitulo: { flex: 1 },
  grade: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, marginHorizontal: -4 },
  celula: { width: "50%", paddingHorizontal: 4 },
  ajuda: { minHeight: 0, paddingVertical: 0 },
  adicionar: { borderStyle: "dashed" },
  botao: { height: 50 },
});
