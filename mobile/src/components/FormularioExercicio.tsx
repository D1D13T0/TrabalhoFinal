import { urlImagem } from "@/services/api";
import { GRUPOS_MUSCULARES } from "@/services/exercicioService";
import { marca } from "@/theme";
import { useExercicioFormViewModel } from "@/viewmodels/useExerciciosViewModel";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  HelperText,
  Icon,
  RadioButton,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

// Formulário de exercício, usado pelas telas "Novo exercício" e "Editar exercício".
export function FormularioExercicio({ exercicioId }: { exercicioId?: number }) {
  const vm = useExercicioFormViewModel(exercicioId);
  const tema = useTheme();

  if (vm.carregando) return <ActivityIndicator style={{ marginTop: 48 }} />;

  const imagem = vm.novaImagem?.uri ?? urlImagem(vm.imagemAtual);

  return (
    <ScrollView
      style={{ backgroundColor: tema.colors.background }}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      {/* Imagem do exercício (ImageView) */}
      <Surface style={styles.imagemCaixa} elevation={1}>
        {imagem ? (
          <Image source={{ uri: imagem }} style={styles.imagem} resizeMode="cover" accessibilityLabel={vm.nome} />
        ) : (
          <View style={[styles.imagem, styles.semImagem, { backgroundColor: tema.colors.surfaceVariant }]}>
            <Icon source="image-plus" size={48} color={tema.colors.onSurfaceVariant} />
            <Text style={{ color: tema.colors.onSurfaceVariant }}>Sem imagem</Text>
          </View>
        )}
        <Button icon="camera" onPress={vm.escolherImagem}>
          {imagem ? "Trocar imagem" : "Escolher imagem"}
        </Button>
      </Surface>

      <Surface style={styles.secao} elevation={1}>
        <TextInput
          label="Nome do exercício *"
          mode="outlined"
          value={vm.nome}
          onChangeText={vm.alterarNome}
          error={!!vm.erros.nome}
        />
        <HelperText type="error" visible={!!vm.erros.nome}>
          {vm.erros.nome}
        </HelperText>

        <Text variant="labelLarge">Grupo muscular *</Text>
        {/* Grid de RadioButtons: 2 colunas */}
        <RadioButton.Group value={vm.grupoMuscular} onValueChange={vm.escolherGrupo}>
          <View style={styles.grade}>
            {GRUPOS_MUSCULARES.map((g) => (
              <View key={g.valor} style={styles.celula}>
                <RadioButton.Item
                  label={g.rotulo}
                  value={g.valor}
                  position="leading"
                  style={styles.radio}
                  labelStyle={styles.rotuloEsquerda}
                />
              </View>
            ))}
          </View>
        </RadioButton.Group>
        <HelperText type="error" visible={!!vm.erros.grupoMuscular}>
          {vm.erros.grupoMuscular}
        </HelperText>

        <TextInput
          label="Descrição / instruções"
          mode="outlined"
          multiline
          numberOfLines={3}
          value={vm.descricao}
          onChangeText={vm.setDescricao}
          placeholder="Ex.: manter a coluna reta, descer em 3 segundos"
        />

        <Checkbox.Item
          label="Exercício ativo (aparece ao montar treinos)"
          status={vm.ativo ? "checked" : "unchecked"}
          onPress={vm.alternarAtivo}
          position="leading"
          style={styles.check}
          labelStyle={styles.rotuloEsquerda}
        />
      </Surface>

      <Button
        mode="contained"
        icon="content-save"
        onPress={vm.salvar}
        loading={vm.salvando}
        disabled={vm.salvando}
        buttonColor={marca.vermelho}
        textColor={marca.branco}
        contentStyle={styles.botao}
      >
        {vm.editando ? "Salvar alterações" : "Cadastrar exercício"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 12, paddingBottom: 40, maxWidth: 720, width: "100%", alignSelf: "center" },
  imagemCaixa: { borderRadius: 16, overflow: "hidden", alignItems: "center", paddingBottom: 4 },
  imagem: { width: "100%", aspectRatio: 4 / 3 },
  semImagem: { alignItems: "center", justifyContent: "center", gap: 4 },
  secao: { borderRadius: 16, padding: 16 },
  grade: { flexDirection: "row", flexWrap: "wrap" },
  celula: { width: "50%" },
  radio: { paddingHorizontal: 0, paddingVertical: 2 },
  rotuloEsquerda: { textAlign: "left" },
  check: { paddingHorizontal: 0 },
  botao: { height: 50 },
});
