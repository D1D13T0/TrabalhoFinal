import { marca } from "@/theme";
import { usePlanoFormViewModel } from "@/viewmodels/usePlanosViewModel";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Chip,
  HelperText,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const OPCOES_DIAS = [1, 2, 3, 4, 5, 6, 7];

// Formulário de plano, usado pelas telas "Novo plano" e "Editar plano".
export function FormularioPlano({ planoId }: { planoId?: number }) {
  const vm = usePlanoFormViewModel(planoId);
  const tema = useTheme();

  if (vm.carregando) return <ActivityIndicator style={{ marginTop: 48 }} />;

  return (
    <ScrollView
      style={{ backgroundColor: tema.colors.background }}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Surface style={styles.secao} elevation={1}>
        <Text variant="labelLarge" style={styles.rotulo}>
          Dias de treino por semana *
        </Text>
        <View style={styles.dias}>
          {OPCOES_DIAS.map((d) => (
            <Chip
              key={d}
              selected={vm.diasPorSemana === d}
              showSelectedOverlay
              mode={vm.diasPorSemana === d ? "flat" : "outlined"}
              onPress={() => vm.escolherDias(d)}
              style={styles.chipDia}
              accessibilityLabel={`${d} dia(s) por semana`}
            >
              {d}x
            </Chip>
          ))}
        </View>
        <HelperText type="error" visible={!!vm.erros.diasPorSemana}>
          {vm.erros.diasPorSemana}
        </HelperText>

        <TextInput
          label="Nome do plano *"
          mode="outlined"
          value={vm.nome}
          onChangeText={vm.alterarNome}
          error={!!vm.erros.nome}
        />
        <HelperText type="error" visible={!!vm.erros.nome}>
          {vm.erros.nome}
        </HelperText>

        <TextInput
          label="Valor mensal *"
          mode="outlined"
          value={vm.valor}
          onChangeText={vm.alterarValor}
          keyboardType="number-pad"
          placeholder="0,00"
          left={<TextInput.Affix text="R$" />}
          error={!!vm.erros.valor}
        />
        <HelperText type="error" visible={!!vm.erros.valor}>
          {vm.erros.valor}
        </HelperText>

        <Checkbox.Item
          label="Plano ativo (disponível para novos alunos)"
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
        {vm.editando ? "Salvar alterações" : "Cadastrar plano"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 12, maxWidth: 720, width: "100%", alignSelf: "center" },
  secao: { borderRadius: 16, padding: 16 },
  rotulo: { marginBottom: 8 },
  dias: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipDia: { minWidth: 56 },
  check: { paddingHorizontal: 0 },
  rotuloEsquerda: { textAlign: "left" },
  botao: { height: 50 },
});
