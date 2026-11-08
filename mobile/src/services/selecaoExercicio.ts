import type { Exercicio } from "@/models";

// Ponte entre a página modal "Selecionar exercício" e o formulário de treino:
// o formulário registra um callback, o modal chama com o exercício escolhido e fecha.
type Callback = (exercicio: Exercicio) => void;

let callbackAtual: Callback | null = null;
let idsJaAdicionados: number[] = [];

export const selecaoExercicio = {
  aguardar(callback: Callback, jaAdicionados: number[]) {
    callbackAtual = callback;
    idsJaAdicionados = jaAdicionados;
  },
  jaAdicionados: () => idsJaAdicionados,
  escolher(exercicio: Exercicio) {
    callbackAtual?.(exercicio);
    callbackAtual = null;
  },
  cancelar() {
    callbackAtual = null;
  },
};
