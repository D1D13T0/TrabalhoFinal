import type { DiaSemana } from "@/models";

// Formatações e máscaras usadas nas telas.

export const DIAS_SEMANA: { valor: DiaSemana; rotulo: string }[] = [
  { valor: "SEG", rotulo: "Seg" },
  { valor: "TER", rotulo: "Ter" },
  { valor: "QUA", rotulo: "Qua" },
  { valor: "QUI", rotulo: "Qui" },
  { valor: "SEX", rotulo: "Sex" },
  { valor: "SAB", rotulo: "Sáb" },
  { valor: "DOM", rotulo: "Dom" },
];

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const apenasDigitos = (texto: string) => texto.replace(/\D/g, "");

// (54) 99999-0000
export function mascaraTelefone(texto: string): string {
  const d = apenasDigitos(texto).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// DD/MM/AAAA
export function mascaraData(texto: string): string {
  const d = apenasDigitos(texto).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// "AAAA-MM-DD" -> "DD/MM/AAAA"
export function isoParaBr(data: string | null | undefined): string {
  if (!data) return "";
  const [a, m, d] = data.split("-");
  return `${d}/${m}/${a}`;
}

// "DD/MM/AAAA" -> "AAAA-MM-DD" (ou null se a data não existir)
export function brParaIso(data: string): string | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);
  if (!partes) return null;
  const [, d, m, a] = partes.map(Number);
  const dt = new Date(a, m - 1, d);
  if (dt.getFullYear() !== a || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return `${a}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Remove acentos e deixa minúsculo, para a busca ignorar "á/a", "Ç/c" etc.
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

// Máscara de dinheiro: digitar "11000" mostra "110,00".
export function mascaraMoeda(texto: string): string {
  const centavos = Number(apenasDigitos(texto).slice(0, 9) || "0");
  return (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// "1.234,50" -> 1234.5
export function moedaParaNumero(texto: string): number {
  return Number(apenasDigitos(texto) || "0") / 100;
}

export function numeroParaMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// "2026-11" -> "Novembro de 2026"
export function nomeMes(mesReferencia: string): string {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  const texto = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Soma (ou subtrai) meses de "AAAA-MM".
export function somarMes(mesReferencia: string, quantidade: number): string {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  const d = new Date(ano, mes - 1 + quantidade, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function mesAtual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function hojeBr(): string {
  return new Date().toLocaleDateString("pt-BR");
}
