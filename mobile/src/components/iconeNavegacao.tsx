import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ColorValue } from "react-native";

export type NomeIcone = keyof typeof MaterialCommunityIcons.glyphMap;

// Gera o ícone usado em abas (tabBarIcon) e no menu lateral (drawerIcon).
export const iconeNavegacao =
  (nome: NomeIcone) =>
  ({ color, size }: { color: ColorValue; size: number }) => (
    <MaterialCommunityIcons name={nome} color={color as string} size={size} />
  );
