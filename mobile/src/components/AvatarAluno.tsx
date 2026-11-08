import { urlImagem } from "@/services/api";
import { iniciais } from "@/utils/formatacao";
import { Avatar, useTheme } from "react-native-paper";

interface Props {
  nome: string;
  foto?: string | null; // nome do arquivo no servidor
  uriLocal?: string | null; // foto recém-escolhida, ainda não enviada
  tamanho?: number;
}

// Foto do aluno (ImageView) ou, se não houver, suas iniciais.
export function AvatarAluno({ nome, foto, uriLocal, tamanho = 48 }: Props) {
  const tema = useTheme();
  const uri = uriLocal ?? urlImagem(foto);
  if (uri) return <Avatar.Image size={tamanho} source={{ uri }} />;
  return (
    <Avatar.Text
      size={tamanho}
      label={iniciais(nome) || "?"}
      style={{ backgroundColor: tema.colors.primaryContainer }}
      color={tema.colors.onPrimaryContainer}
    />
  );
}
