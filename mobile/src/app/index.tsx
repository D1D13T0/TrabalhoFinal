import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";

// Rota "/": manda cada usuário para a tela inicial do seu perfil.
export default function Index() {
  const { usuario } = useAuth();

  if (!usuario) return <Redirect href="/login" />;
  if (usuario.trocarSenha) return <Redirect href="/trocar-senha" />;
  if (usuario.perfil === "ADMIN") return <Redirect href="/inicio" />;
  return <Redirect href="/meus-treinos" />;
}
