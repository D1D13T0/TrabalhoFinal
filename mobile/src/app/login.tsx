import { Logo } from "@/components/Logo";
import { marca } from "@/theme";
import { useLoginViewModel } from "@/viewmodels/useLoginViewModel";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, HelperText, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const vm = useLoginViewModel();
  const tema = useTheme();

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: tema.dark ? tema.colors.background : marca.azul }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <View style={styles.topo}>
            <Logo tamanho={200} />
            <Text variant="titleMedium" style={styles.slogan}>
              Força • Foco • Performance
            </Text>
          </View>

          <Surface style={styles.cartao} elevation={2}>
            <Text variant="headlineSmall" style={[styles.titulo, { color: tema.colors.primary }]}>
              Entrar
            </Text>

            <TextInput
              label="E-mail"
              mode="outlined"
              value={vm.email}
              onChangeText={vm.setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              left={<TextInput.Icon icon="email-outline" />}
              error={!!vm.erros.email}
            />
            <HelperText type="error" visible={!!vm.erros.email}>
              {vm.erros.email}
            </HelperText>

            <TextInput
              label="Senha"
              mode="outlined"
              value={vm.senha}
              onChangeText={vm.setSenha}
              secureTextEntry={!vm.mostrarSenha}
              autoCapitalize="none"
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon icon={vm.mostrarSenha ? "eye-off" : "eye"} onPress={vm.alternarMostrarSenha} />
              }
              onSubmitEditing={vm.onEntrar}
              error={!!vm.erros.senha}
            />
            <HelperText type="error" visible={!!vm.erros.senha}>
              {vm.erros.senha}
            </HelperText>

            {vm.erros.geral ? (
              <HelperText type="error" visible style={styles.erroGeral}>
                {vm.erros.geral}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={vm.onEntrar}
              loading={vm.carregando}
              disabled={vm.carregando}
              buttonColor={marca.vermelho}
              textColor={marca.branco}
              contentStyle={styles.botao}
            >
              Entrar
            </Button>
          </Surface>

          <Text variant="bodySmall" style={styles.rodape}>
            Esqueceu a senha? Fale com a recepção da academia.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { flexGrow: 1, justifyContent: "center", padding: 20, gap: 20, maxWidth: 480, width: "100%", alignSelf: "center" },
  topo: { alignItems: "center", gap: 12 },
  slogan: { color: marca.branco, fontWeight: "700", letterSpacing: 1 },
  cartao: { borderRadius: 20, padding: 20 },
  titulo: { fontWeight: "700", marginBottom: 12 },
  erroGeral: { textAlign: "center", marginBottom: 8 },
  botao: { height: 50 },
  rodape: { color: "#D3E4F5", textAlign: "center" },
});
