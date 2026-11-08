// Funções de data usando o horário local, no formato do banco (AAAA-MM-DD / AAAA-MM).

const doisDigitos = (n: number) => String(n).padStart(2, "0");

export function formatarData(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

export function formatarMes(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}`;
}

export function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function diferencaEmDias(de: Date, ate: Date): number {
  const umDia = 24 * 60 * 60 * 1000;
  return Math.round((inicioDoDia(ate).getTime() - inicioDoDia(de).getTime()) / umDia);
}
