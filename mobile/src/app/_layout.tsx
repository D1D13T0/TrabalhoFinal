import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MensagemProvider } from "@/contexts/MensagemContext";
import { migrarBanco, NOME_BANCO } from "@/database/migracoes";
import { SQLiteProvider } from "expo-sqlite";
import { opcoesCabecalho, temaClaro, temaEscuro, temaNavegacao } from "@/theme";
import { Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, PaperProvider } from "react-native-paper";

// Layout raiz: provedores globais (tema, login, mensagens) e as rotas protegidas por perfil.
export default function RootLayout() {
  const esquema = useColorScheme();
  const tema = esquema === "dark" ? temaEscuro : temaClaro;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={tema}>
        <ThemeProvider value={temaNavegacao(tema)}>
          <AuthProvider>
            <MensagemProvider>
              <StatusBar style="light" />
              {/* Banco SQLite local: aberto (e migrado) antes de montar a navegação. */}
              <SQLiteProvider databaseName={NOME_BANCO} onInit={migrarBanco}>
                <Navegacao />
              </SQLiteProvider>
            </MensagemProvider>
          </AuthProvider>
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

function Navegacao() {
  const { usuario, carregando } = useAuth();
  const tema = useColorScheme() === "dark" ? temaEscuro : temaClaro;

  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: tema.colors.background }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const logado = !!usuario;
  const precisaTrocarSenha = logado && usuario.trocarSenha;

  return (
    <Stack screenOptions={{ ...opcoesCabecalho(tema), headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Protected guard={!logado}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={!!precisaTrocarSenha}>
        <Stack.Screen name="trocar-senha" />
      </Stack.Protected>

      <Stack.Protected guard={logado && !precisaTrocarSenha && usuario.perfil === "ADMIN"}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>

      <Stack.Protected guard={logado && !precisaTrocarSenha && usuario.perfil === "ALUNO"}>
        <Stack.Screen name="(aluno)" />
      </Stack.Protected>
    </Stack>
  );
}
