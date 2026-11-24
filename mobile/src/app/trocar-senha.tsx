import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { useTrocarSenhaViewModel } from "@/viewmodels/useTrocarSenhaViewModel";
import { Fragment } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, HelperText, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrocarSenhaScreen() {
  const { usuario } = useAuth();
  const primeiroAcesso = !!usuario?.trocarSenha;
  const voltar = () => router.canGoBack() ? router.back() : router.replace("/");
  const vm = useTrocarSenhaViewModel(primeiroAcesso ? () => router.replace("/") : voltar);
  const tema = useTheme();

  const campos = [
    { label: "Senha atual", valor: vm.senhaAtual, set: vm.setSenhaAtual, erro: vm.erros.senhaAtual },
    { label: "Nova senha", valor: vm.novaSenha, set: vm.setNovaSenha, erro: vm.erros.novaSenha },
    { label: "Confirmar nova senha", valor: vm.confirmacao, set: vm.setConfirmacao, erro: vm.erros.confirmacao },
  ];

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: tema.colors.background }]}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Surface style={styles.cartao} elevation={1}>
          <Text variant="headlineSmall" style={{ color: tema.colors.primary, fontWeight: "700" }}>
            {primeiroAcesso ? "Crie sua senha" : "Alterar minha senha"}
          </Text>
          <Text variant="bodyMedium" style={styles.texto}>
            {primeiroAcesso
              ? "Este é seu primeiro acesso. Troque a senha inicial que a academia te passou por uma senha só sua."
              : "Informe sua senha atual e escolha uma nova senha."}
          </Text>

          {campos.map((c) => (
            <Fragment key={c.label}>
              <TextInput
                label={c.label}
                mode="outlined"
                secureTextEntry
                autoCapitalize="none"
                value={c.valor}
                onChangeText={c.set}
                error={!!c.erro}
                left={<TextInput.Icon icon="lock-outline" />}
              />
              <HelperText type="error" visible={!!c.erro}>
                {c.erro}
              </HelperText>
            </Fragment>
          ))}

          <Button mode="contained" onPress={vm.onSalvar} loading={vm.carregando} disabled={vm.carregando}>
            Salvar senha
          </Button>
          <Button mode="text" onPress={primeiroAcesso ? vm.sair : voltar} disabled={vm.carregando} style={{ marginTop: 8 }}>
            {primeiroAcesso ? "Sair" : "Cancelar"}
          </Button>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { flexGrow: 1, justifyContent: "center", padding: 20, maxWidth: 480, width: "100%", alignSelf: "center" },
  cartao: { borderRadius: 20, padding: 20 },
  texto: { marginTop: 8, marginBottom: 16 },
});
