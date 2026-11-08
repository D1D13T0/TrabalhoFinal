import { marca } from "@/theme";
import { DIAS_SEMANA, formatarMoeda } from "@/utils/formatacao";
import { useAlunoFormViewModel } from "@/viewmodels/useAlunoFormViewModel";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  HelperText,
  RadioButton,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { AvatarAluno } from "./AvatarAluno";
import { ConfirmarExclusao } from "./ConfirmarExclusao";

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  const tema = useTheme();
  return (
    <Surface style={styles.secao} elevation={1}>
      <Text variant="titleSmall" style={[styles.tituloSecao, { color: tema.colors.primary }]}>
        {titulo}
      </Text>
      {children}
    </Surface>
  );
}

// Formulário de aluno, usado pelas telas "Novo aluno" e "Editar aluno".
export function FormularioAluno({ alunoId }: { alunoId?: number }) {
  const vm = useAlunoFormViewModel(alunoId);
  const tema = useTheme();
  const { form, erros } = vm;

  if (vm.carregando) {
    return <ActivityIndicator style={{ marginTop: 48 }} />;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={{ backgroundColor: tema.colors.background }}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {/* Foto (ImageView) */}
        <View style={styles.foto}>
          <AvatarAluno nome={form.nome} foto={vm.fotoAtual} uriLocal={vm.novaFoto?.uri} tamanho={96} />
          <Button icon="camera" mode="text" onPress={vm.escolherFoto}>
            {vm.fotoAtual || vm.novaFoto ? "Trocar foto" : "Escolher foto"}
          </Button>
          {alunoId !== undefined && (
            <Button
              icon="clipboard-list-outline"
              mode="contained-tonal"
              onPress={() =>
                router.push({ pathname: "/aluno/treinos/[id]", params: { id: alunoId, nome: form.nome.split(" ")[0] } })
              }
            >
              Treinos do aluno
            </Button>
          )}
        </View>

        <Secao titulo="Dados pessoais">
          <TextInput
            label="Nome completo *"
            mode="outlined"
            value={form.nome}
            onChangeText={(t) => vm.alterar("nome", t)}
            error={!!erros.nome}
          />
          <HelperText type="error" visible={!!erros.nome}>
            {erros.nome}
          </HelperText>

          <TextInput
            label="E-mail (login) *"
            mode="outlined"
            value={form.email}
            onChangeText={(t) => vm.alterar("email", t)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!erros.email}
          />
          <HelperText type="error" visible={!!erros.email}>
            {erros.email}
          </HelperText>

          {/* Grid: duas colunas */}
          <View style={styles.linha}>
            <View style={styles.coluna}>
              <TextInput
                label="Telefone *"
                mode="outlined"
                value={form.telefone}
                onChangeText={vm.alterarTelefone}
                keyboardType="phone-pad"
                placeholder="(54) 99999-0000"
                error={!!erros.telefone}
              />
              <HelperText type="error" visible={!!erros.telefone}>
                {erros.telefone}
              </HelperText>
            </View>
            <View style={styles.coluna}>
              <TextInput
                label="Nascimento *"
                mode="outlined"
                value={form.dataNascimento}
                onChangeText={vm.alterarData}
                keyboardType="number-pad"
                placeholder="DD/MM/AAAA"
                error={!!erros.dataNascimento}
              />
              <HelperText type="error" visible={!!erros.dataNascimento}>
                {erros.dataNascimento}
              </HelperText>
            </View>
          </View>

          <Text variant="labelLarge">Sexo *</Text>
          <RadioButton.Group value={form.sexo} onValueChange={(v) => vm.alterar("sexo", v as typeof form.sexo)}>
            <View style={styles.radios}>
              <RadioButton.Item label="Masculino" value="M" position="leading" style={styles.radio} />
              <RadioButton.Item label="Feminino" value="F" position="leading" style={styles.radio} />
              <RadioButton.Item label="Outro" value="O" position="leading" style={styles.radio} />
            </View>
          </RadioButton.Group>
          <HelperText type="error" visible={!!erros.sexo}>
            {erros.sexo}
          </HelperText>
        </Secao>

        <Secao titulo="Plano e treinos">
          <RadioButton.Group
            value={form.planoId ? String(form.planoId) : ""}
            onValueChange={(v) => vm.alterar("planoId", Number(v))}
          >
            {vm.planos.map((p) => (
              <RadioButton.Item
                key={p.id}
                value={String(p.id)}
                label={`${p.nome} — ${formatarMoeda(p.valor)}${p.ativo ? "" : " (inativo)"}`}
                position="leading"
                style={styles.radioPlano}
                labelStyle={styles.rotuloEsquerda}
              />
            ))}
          </RadioButton.Group>
          {vm.planos.length === 0 && <Text>Nenhum plano ativo. Cadastre um plano primeiro.</Text>}
          <HelperText type="error" visible={!!erros.planoId}>
            {erros.planoId}
          </HelperText>

          <Text variant="labelLarge">
            Dias de treino *{vm.planoSelecionado ? ` (${form.diasTreino.length}/${vm.planoSelecionado.diasPorSemana})` : ""}
          </Text>
          {/* Grid de checkboxes: 4 por linha */}
          <View style={styles.gradeDias}>
            {DIAS_SEMANA.map((d) => (
              <View key={d.valor} style={styles.celulaDia}>
                <Checkbox.Item
                  label={d.rotulo}
                  status={form.diasTreino.includes(d.valor) ? "checked" : "unchecked"}
                  onPress={() => vm.alternarDia(d.valor)}
                  position="leading"
                  style={styles.checkDia}
                  labelStyle={styles.labelDia}
                />
              </View>
            ))}
          </View>
          <HelperText type="error" visible={!!erros.diasTreino}>
            {erros.diasTreino}
          </HelperText>

          <TextInput
            label="Dia de vencimento *"
            mode="outlined"
            value={form.diaVencimento}
            onChangeText={(t) => vm.alterar("diaVencimento", t.replace(/\D/g, "").slice(0, 2))}
            keyboardType="number-pad"
            right={<TextInput.Affix text="de cada mês" />}
            error={!!erros.diaVencimento}
          />
          <HelperText type="error" visible={!!erros.diaVencimento}>
            {erros.diaVencimento}
          </HelperText>
        </Secao>

        <Secao titulo="Saúde e acesso">
          <Checkbox.Item
            label="Possui restrição médica"
            status={form.possuiRestricaoMedica ? "checked" : "unchecked"}
            onPress={() => vm.alterar("possuiRestricaoMedica", !form.possuiRestricaoMedica)}
            position="leading"
            style={styles.checkLinha}
            labelStyle={styles.rotuloEsquerda}
          />
          <TextInput
            label={form.possuiRestricaoMedica ? "Descreva a restrição *" : "Observações"}
            mode="outlined"
            multiline
            numberOfLines={3}
            value={form.observacoes}
            onChangeText={(t) => vm.alterar("observacoes", t)}
            error={!!erros.observacoes}
          />
          <HelperText type="error" visible={!!erros.observacoes}>
            {erros.observacoes}
          </HelperText>

          {!vm.editando && (
            <>
              <TextInput
                label="Senha inicial *"
                mode="outlined"
                value={form.senhaInicial}
                onChangeText={(t) => vm.alterar("senhaInicial", t)}
                autoCapitalize="none"
                error={!!erros.senhaInicial}
              />
              <HelperText type={erros.senhaInicial ? "error" : "info"} visible>
                {erros.senhaInicial ?? "Passe essa senha ao aluno; ele vai trocá-la no primeiro acesso."}
              </HelperText>
            </>
          )}

          {vm.editando && (
            <Checkbox.Item
              label="Cadastro ativo"
              status={form.ativo ? "checked" : "unchecked"}
              onPress={() => vm.alterar("ativo", !form.ativo)}
              position="leading"
              style={styles.checkLinha}
              labelStyle={styles.rotuloEsquerda}
            />
          )}
        </Secao>

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
          {vm.editando ? "Salvar alterações" : "Cadastrar aluno"}
        </Button>

        {vm.editando && (
          <Button mode="outlined" icon="trash-can-outline" textColor={tema.colors.error} onPress={vm.pedirExclusao}>
            Excluir aluno
          </Button>
        )}
      </ScrollView>

      <ConfirmarExclusao
        visivel={vm.confirmarExclusao}
        mensagem={`Excluir ${form.nome}? Os treinos e pagamentos desse aluno também serão apagados. Essa ação não pode ser desfeita.`}
        excluindo={vm.excluindo}
        onCancelar={vm.cancelarExclusao}
        onConfirmar={vm.excluir}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 16, gap: 12, paddingBottom: 40, maxWidth: 720, width: "100%", alignSelf: "center" },
  foto: { alignItems: "center", gap: 4 },
  secao: { borderRadius: 16, padding: 16 },
  tituloSecao: { fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  linha: { flexDirection: "row", gap: 12 },
  coluna: { flex: 1 },
  radios: { flexDirection: "row", flexWrap: "wrap" },
  radio: { paddingHorizontal: 0, paddingVertical: 2 },
  radioPlano: { paddingHorizontal: 0, paddingVertical: 2 },
  gradeDias: { flexDirection: "row", flexWrap: "wrap" },
  celulaDia: { width: "25%" },
  checkDia: { paddingHorizontal: 0, paddingVertical: 0 },
  labelDia: { textAlign: "left" },
  checkLinha: { paddingHorizontal: 0 },
  rotuloEsquerda: { textAlign: "left" },
  botao: { height: 50 },
});
