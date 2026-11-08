import type { ImagemSelecionada } from "@/services/alunoService";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

// Abre a galeria e guarda a imagem escolhida (ainda não enviada ao servidor).
export function useEscolherImagem(aspecto: [number, number] = [1, 1]) {
  const [imagem, setImagem] = useState<ImagemSelecionada | null>(null);

  async function escolher() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: aspecto,
      quality: 0.7,
    });
    if (resultado.canceled) return;
    const arquivo = resultado.assets[0];
    setImagem({
      uri: arquivo.uri,
      nome: arquivo.fileName ?? `imagem-${Date.now()}.jpg`,
      tipo: arquivo.mimeType ?? "image/jpeg",
    });
  }

  return { imagem, escolher };
}
