import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Guarda dados sensíveis (token): SecureStore no celular, localStorage na web.
export const armazenamento = {
  async ler(chave: string): Promise<string | null> {
    if (Platform.OS === "web") return globalThis.localStorage?.getItem(chave) ?? null;
    return SecureStore.getItemAsync(chave);
  },

  async salvar(chave: string, valor: string): Promise<void> {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(chave, valor);
      return;
    }
    await SecureStore.setItemAsync(chave, valor);
  },

  async remover(chave: string): Promise<void> {
    if (Platform.OS === "web") {
      globalThis.localStorage?.removeItem(chave);
      return;
    }
    await SecureStore.deleteItemAsync(chave);
  },
};
