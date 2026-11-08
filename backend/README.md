# Backend – API da Academia

Node.js + Express + Prisma + SQLite (o banco é o arquivo `dev.db`, criado automaticamente).

## Como rodar

```bash
npm install
cp .env.example .env      # depois troque o JWT_SECRET
npm run db:migrate        # cria o banco e as tabelas
npm run db:seed           # dados iniciais
npm run dev               # http://localhost:3333
```

Usuários do seed:

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | admin@academia.com | admin123 |
| Aluno | aluno@academia.com | aluno123 |

Para recriar o banco do zero: `npm run db:reset`.

## Estrutura

```
prisma/          schema (tabelas), migrations e seed
src/
  config/        variáveis de ambiente
  database/      conexão do Prisma com o SQLite
  daos/          DAOs: única camada que acessa o banco (uma por tabela)
  services/      regras de negócio (validação de plano, status da mensalidade...)
  controllers/   recebem a requisição, validam e respondem
  routes/        definição das rotas e permissões por perfil
  middlewares/   autenticação (JWT), upload de imagens, tratamento de erros
  validators/    validação dos dados com Zod
uploads/         fotos de alunos e imagens de exercícios
```

## Rotas

Todas (menos o login) exigem `Authorization: Bearer <token>`.

- **Público:** `POST /auth/login`
- **Logado:** `GET /auth/me`, `PUT /auth/senha`
- **Aluno:** `GET /me/perfil`, `/me/treinos`, `/me/pagamentos`, `/me/mensalidade`
- **Admin:**
  - `GET /dashboard`
  - CRUD em `/planos`, `/alunos`, `/exercicios`, `/treinos`, `/pagamentos` (`GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`)
  - Listagens aceitam `?busca=` e filtros (`ativo`, `alunoId`, `pago`, `mes`, `grupoMuscular`)
  - `POST /alunos/:id/foto` e `POST /exercicios/:id/imagem` (multipart, campo `imagem`)
  - `GET /alunos/:id/mensalidade`
