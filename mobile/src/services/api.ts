import Constants from "expo-constants";
import { Platform } from "react-native";

// Endereço da API. Ordem de prioridade:
// 1) EXPO_PUBLIC_API_URL no arquivo .env do mobile;
// 2) o IP do PC que está rodando o Expo (o celular já o enxerga pela rede Wi-Fi);
// 3) localhost (navegador no próprio PC).
function descobrirUrlApi(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (host && Platform.OS !== "web") return `http://${host}:3333`;
  return "http://localhost:3333";
}

export const API_URL = descobrirUrlApi();

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly detalhes: { campo: string; mensagem: string }[] = [],
  ) {
    super(message);
  }
}

let token: string | null = null;
let aoExpirarSessao: (() => void) | null = null;

export function definirToken(novo: string | null) {
  token = novo;
}

export function aoSessaoExpirar(callback: () => void) {
  aoExpirarSessao = callback;
}

export function urlImagem(arquivo: string | null | undefined): string | undefined {
  return arquivo ? `${API_URL}/uploads/${arquivo}` : undefined;
}

async function requisicao<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const ehFormData = typeof FormData !== "undefined" && corpo instanceof FormData;
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: {
        ...(ehFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo === undefined ? undefined : ehFormData ? (corpo as FormData) : JSON.stringify(corpo),
    });
  } catch {
    throw new ApiError(`Não foi possível conectar ao servidor (${API_URL}).`, 0);
  }

  if (resposta.status === 204) return undefined as T;
  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    if (resposta.status === 401 && token) aoExpirarSessao?.();
    throw new ApiError(dados?.erro ?? "Erro inesperado.", resposta.status, dados?.detalhes);
  }
  return dados as T;
}

// Monta "?busca=x&ativo=true" ignorando valores vazios.
export function montarQuery(params: Record<string, string | number | boolean | undefined>): string {
  const partes = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return partes.length ? `?${partes.join("&")}` : "";
}

export const api = {
  get: <T>(caminho: string) => requisicao<T>("GET", caminho),
  post: <T>(caminho: string, corpo?: unknown) => requisicao<T>("POST", caminho, corpo),
  put: <T>(caminho: string, corpo?: unknown) => requisicao<T>("PUT", caminho, corpo),
  delete: (caminho: string) => requisicao<void>("DELETE", caminho),
};
