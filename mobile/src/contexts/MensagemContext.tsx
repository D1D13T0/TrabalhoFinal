import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Snackbar, useTheme } from "react-native-paper";

type Tipo = "sucesso" | "erro" | "info";

interface MensagemContextValor {
  mostrarMensagem: (texto: string, tipo?: Tipo) => void;
}

const MensagemContext = createContext<MensagemContextValor | null>(null);

// Snackbar global: qualquer tela chama mostrarMensagem("Aluno salvo!").
export function MensagemProvider({ children }: { children: ReactNode }) {
  const tema = useTheme();
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: Tipo } | null>(null);

  const mostrarMensagem = useCallback((texto: string, tipo: Tipo = "sucesso") => {
    setMensagem({ texto, tipo });
  }, []);

  const cores: Record<Tipo, string> = {
    sucesso: "#2E7D32",
    erro: tema.colors.error,
    info: tema.colors.inverseSurface,
  };

  return (
    <MensagemContext.Provider value={{ mostrarMensagem }}>
      {children}
      <Snackbar
        visible={!!mensagem}
        onDismiss={() => setMensagem(null)}
        duration={3000}
        style={{ backgroundColor: mensagem ? cores[mensagem.tipo] : undefined }}
        action={{ label: "OK", textColor: "#FFFFFF", onPress: () => setMensagem(null) }}
      >
        {mensagem?.texto}
      </Snackbar>
    </MensagemContext.Provider>
  );
}

export function useMensagem() {
  const ctx = useContext(MensagemContext);
  if (!ctx) throw new Error("useMensagem deve ser usado dentro de <MensagemProvider>.");
  return ctx;
}
