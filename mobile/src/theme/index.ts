import { DarkTheme as NavDark, DefaultTheme as NavLight, type Theme as NavTheme } from "expo-router";
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from "react-native-paper";

// Cores da identidade visual da Perfformance Academia (extraídas da logo).
export const marca = {
  azul: "#06436B",
  azulClaro: "#5B9BD5",
  vermelho: "#BB1D2D",
  vermelhoClaro: "#FF6B6B",
  preto: "#121417",
  grafite: "#1E2227",
  cinza: "#8A9099",
  branco: "#FFFFFF",
};

// Cores extras para status (pago, a vencer, atrasado).
export const statusCores = {
  sucesso: "#2E7D32",
  aviso: "#ED8B00",
  erro: marca.vermelho,
};

export const temaClaro: MD3Theme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: marca.azul,
    onPrimary: marca.branco,
    primaryContainer: "#D3E4F5",
    onPrimaryContainer: "#001D33",
    secondary: marca.vermelho,
    onSecondary: marca.branco,
    secondaryContainer: "#DCE6F0",
    onSecondaryContainer: "#0A2A44",
    tertiary: "#4A5568",
    error: "#B3261E",
    errorContainer: "#FFDAD7",
    onErrorContainer: "#410005",
    background: "#F4F6F9",
    surface: marca.branco,
    surfaceVariant: "#E3E8EF",
    onSurfaceVariant: "#44505C",
    outline: "#C2CAD4",
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: "#FFFFFF",
      level2: "#F7F9FC",
      level3: "#E9EEF4",
    },
  },
};

export const temaEscuro: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 3,
  colors: {
    ...MD3DarkTheme.colors,
    primary: marca.azulClaro,
    onPrimary: "#00243F",
    primaryContainer: marca.azul,
    onPrimaryContainer: "#D3E4F5",
    secondary: marca.vermelhoClaro,
    onSecondary: "#410005",
    secondaryContainer: "#2B3A4A",
    onSecondaryContainer: "#D3E4F5",
    tertiary: "#A0AEC0",
    errorContainer: "#5C1118",
    onErrorContainer: "#FFDAD7",
    background: marca.preto,
    surface: marca.grafite,
    surfaceVariant: "#2B3138",
    onSurfaceVariant: "#BFC7D1",
    outline: "#4A535E",
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: marca.grafite,
      level2: "#252A30",
      level3: "#2B3138",
    },
  },
};

// Tema da navegação (cabeçalhos, abas e menu lateral) combinando com o Paper.
export function temaNavegacao(paper: MD3Theme): NavTheme {
  const base = paper.dark ? NavDark : NavLight;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: paper.colors.primary,
      background: paper.colors.background,
      card: paper.colors.surface,
      text: paper.colors.onSurface,
      border: paper.colors.outline,
      notification: marca.vermelho,
    },
  };
}

// Cabeçalho azul-marinho (claro) ou grafite (escuro) usado em todas as pilhas de telas.
export function opcoesCabecalho(paper: MD3Theme) {
  return {
    headerStyle: { backgroundColor: paper.dark ? marca.grafite : marca.azul },
    headerTintColor: marca.branco,
    headerTitleStyle: { fontWeight: "700" as const },
  };
}
