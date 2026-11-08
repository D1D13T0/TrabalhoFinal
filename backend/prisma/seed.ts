// Popula o banco com dados iniciais para desenvolvimento e apresentação.
// Rode com: npm run db:seed
import bcrypt from "bcryptjs";
import { prisma } from "../src/database/prisma";

async function main() {
  const senhaAdmin = await bcrypt.hash("admin123", 10);
  await prisma.usuario.upsert({
    where: { email: "admin@academia.com" },
    update: {},
    create: { nome: "Administradora", email: "admin@academia.com", senhaHash: senhaAdmin, perfil: "ADMIN", trocarSenha: false },
  });

  if ((await prisma.plano.count()) === 0) {
    await prisma.plano.createMany({
      data: [
        { nome: "2x por semana", diasPorSemana: 2, valor: 90 },
        { nome: "3x por semana", diasPorSemana: 3, valor: 110 },
        { nome: "5x por semana", diasPorSemana: 5, valor: 140 },
      ],
    });
  }

  if ((await prisma.exercicio.count()) === 0) {
    await prisma.exercicio.createMany({
      data: [
        { nome: "Supino reto", grupoMuscular: "PEITO" },
        { nome: "Crucifixo", grupoMuscular: "PEITO" },
        { nome: "Puxada frontal", grupoMuscular: "COSTAS" },
        { nome: "Remada baixa", grupoMuscular: "COSTAS" },
        { nome: "Agachamento livre", grupoMuscular: "PERNAS" },
        { nome: "Leg press 45°", grupoMuscular: "PERNAS" },
        { nome: "Desenvolvimento", grupoMuscular: "OMBROS" },
        { nome: "Rosca direta", grupoMuscular: "BICEPS" },
        { nome: "Tríceps corda", grupoMuscular: "TRICEPS" },
        { nome: "Abdominal supra", grupoMuscular: "ABDOMEN" },
      ],
    });
  }

  if ((await prisma.aluno.count()) === 0) {
    const plano = await prisma.plano.findFirstOrThrow({ where: { diasPorSemana: 3 } });
    const supino = await prisma.exercicio.findFirstOrThrow({ where: { nome: "Supino reto" } });
    const triceps = await prisma.exercicio.findFirstOrThrow({ where: { nome: "Tríceps corda" } });

    await prisma.aluno.create({
      data: {
        telefone: "(54) 99999-0000",
        dataNascimento: "2000-05-10",
        sexo: "M",
        diaVencimento: 10,
        diasTreino: "SEG,QUA,SEX",
        plano: { connect: { id: plano.id } },
        usuario: {
          create: {
            nome: "Aluno Exemplo",
            email: "aluno@academia.com",
            senhaHash: await bcrypt.hash("aluno123", 10),
            perfil: "ALUNO",
            trocarSenha: false,
          },
        },
        treinos: {
          create: {
            nome: "Treino A - Peito e Tríceps",
            itens: {
              create: [
                { exercicioId: supino.id, ordem: 1, series: 4, repeticoes: "10-12", carga: 40, descansoSegundos: 60 },
                { exercicioId: triceps.id, ordem: 2, series: 3, repeticoes: "12", carga: 20, descansoSegundos: 45 },
              ],
            },
          },
        },
      },
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
