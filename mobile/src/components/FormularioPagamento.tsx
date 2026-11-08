import { FORMAS_PAGAMENTO } from "@/services/pagamentoService";
import { marca } from "@/theme";
import { usePagamentoFormViewModel } from "@/viewmodels/usePagamentoFormViewModel";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Checkbox, HelperText, List, RadioButton, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { AvatarAluno } from "./AvatarAluno";
import { ConfirmarExclusao } from "./ConfirmarExclusao";
import { SeletorAluno } from "./SeletorAluno";
import { SeletorMes } from "./SeletorMes";

interface Props {
  pagamentoId?: number;
  alunoId?: number;
  mes?: string;
}

// Formulário de pagamento (registrar ou editar).
export function FormularioPagamento(props: Props) {
  const vm = usePagamentoFormViewModel(props);
  const tema = useTheme();

  if (vm.carregando) return <ActivityIndicator style={{ marginTop: 48 }} />;

  const aluno = vm.alunoSelecionado;

  return (
    <ScrollView style={{ backgroundColor: tema.colors.background }} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
      <Surface style={styles.secao} elevation={1}>
        <List.Item
          title={aluno ? aluno.usuario.nome : "Selecionar aluno *"}
          description={aluno ? `${aluno.plano.nome} • vence todo dia ${aluno.diaVencimento}` : "Toque para escolher"}
          onPress={vm.editando ? undefined : vm.abrirSeletor}
          left={() => (aluno ? <AvatarAluno nome={aluno.usuario.nome} foto={aluno.foto} tamanho={40} /> : <List.Icon icon="account-search" />)}
          right={(p) => (vm.editando ? null : <List.Icon {...p} icon="chevron-right" />)}
          style={[styles.seletor, { borderColor: vm.erros.aluno ? tema.colors.error : tema.colors.outline }]}
        />
        <HelperText type="error" visible={!!vm.erros.aluno}>
          {vm.erros.aluno}
        </HelperText>

        <Text variant="labelLarge" style={styles.rotulo}>
          Mês de referência
        </Text>
        <SeletorMes valor={vm.mesReferencia} onMudar={vm.mudarMes} />
        <HelperText type="error" visible={!!vm.erros.mesReferencia}>
          {vm.erros.mesReferencia}
        </HelperText>

        <TextInput
          label="Valor *"
          mode="outlined"
          value={vm.valor}
          onChangeText={vm.alterarValor}
          keyboardType="number-pad"
          left={<TextInput.Affix text="R$" />}
          error={!!vm.erros.valor}
        />
        <HelperText type="error" visible={!!vm.erros.valor}>
          {vm.erros.valor}
        </HelperText>

        <Text variant="labelLarge" style={styles.rotulo}>
          Forma de pagamento
        </Text>
        <RadioButton.Group value={vm.formaPagamento} onValueChange={(v) => vm.setFormaPagamento(v as typeof vm.formaPagamento)}>
          <View style={styles.formas}>
            {FORMAS_PAGAMENTO.map((f) => (
              <RadioButton.Item key={f.valor} label={f.rotulo} value={f.valor} position="leading" style={styles.radio} labelStyle={styles.rotuloEsquerda} />
            ))}
          </View>
        </RadioButton.Group>

        <Checkbox.Item
          label="Pagamento recebido"
          status={vm.pago ? "checked" : "unchecked"}
          onPress={vm.alternarPago}
          position="leading"
          style={styles.check}
          labelStyle={styles.rotuloEsquerda}
        />
        {vm.pago && (
          <>
            <TextInput
              label="Data do pagamento *"
              mode="outlined"
              value={vm.dataPagamento}
              onChangeText={vm.alterarData}
              keyboardType="number-pad"
              placeholder="DD/MM/AAAA"
              error={!!vm.erros.dataPagamento}
            />
            <HelperText type="error" visible={!!vm.erros.dataPagamento}>
              {vm.erros.dataPagamento}
            </HelperText>
          </>
        )}
      </Surface>

      <Button mode="contained" icon="content-save" onPress={vm.salvar} loading={vm.salvando} disabled={vm.salvando} buttonColor={marca.vermelho} textColor={marca.branco} contentStyle={styles.botao}>
        {vm.editando ? "Salvar alterações" : "Registrar pagamento"}
      </Button>
      {vm.editando && (
        <Button mode="outlined" icon="trash-can-outline" textColor={tema.colors.error} onPress={vm.pedirExclusao}>
          Excluir pagamento
        </Button>
      )}

      <SeletorAluno visivel={vm.seletorAberto} alunos={vm.alunos} selecionadoId={aluno?.id ?? null} onEscolher={vm.escolherAluno} onFechar={vm.fecharSeletor} />
      <ConfirmarExclusao
        visivel={vm.confirmarExclusao}
        mensagem={`Excluir este pagamento de ${aluno?.usuario.nome}? Essa ação não pode ser desfeita.`}
        excluindo={vm.excluindo}
        onCancelar={vm.cancelarExclusao}
        onConfirmar={vm.excluir}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 12, paddingBottom: 40, maxWidth: 720, width: "100%", alignSelf: "center" },
  secao: { borderRadius: 16, padding: 16 },
  seletor: { borderWidth: 1, borderRadius: 12, paddingLeft: 8 },
  rotulo: { marginBottom: 6 },
  formas: { flexDirection: "row", flexWrap: "wrap" },
  radio: { paddingHorizontal: 0, paddingVertical: 2 },
  rotuloEsquerda: { textAlign: "left" },
  check: { paddingHorizontal: 0 },
  botao: { height: 50 },
});
