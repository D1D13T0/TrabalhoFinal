# PerfformanceApp

Trabalho final de Programação para Dispositivos Móveis. O aplicativo gerencia alunos, planos, exercícios, fichas de treino e mensalidades da Perfformance Academia.

O administrador gerencia os cadastros, monta fichas e registra pagamentos. O aluno consulta suas fichas, marca exercícios concluídos e acompanha mensalidade e perfil. Ambos podem alterar a própria senha.

## Executar no celular com Expo Go

Os comandos usam PowerShell e partem da raiz do projeto. Tenha Node.js com npm no computador e Expo Go compatível com o **Expo SDK 58** no celular. Conecte os dois dispositivos à mesma rede Wi-Fi.

### 1. Iniciar a API

No primeiro terminal, instale as dependências e prepare o SQLite:

```powershell
cd backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm install
npm run db:migrate
npm run db:seed
```

Defina um valor próprio para `JWT_SECRET` em `backend/.env`. Com o banco preparado, inicie a API e mantenha o terminal aberto:

```powershell
npm run dev
```

Nas próximas execuções, basta rodar `npm run dev` dentro de `backend`. A porta padrão é `3333`.

### 2. Iniciar o app

Abra outro terminal na raiz do projeto:

```powershell
cd mobile
npm install
npx expo start --go
```

No Android, escaneie o QR code do terminal pelo Expo Go. No iPhone, use a câmera. Se o Expo Go pedir autenticação, rode `npx expo login` no computador e entre com a mesma conta no celular.

### 3. Testar o login

O seed cria estas contas para demonstração local:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@academia.com` | `admin123` |
| Aluno | `aluno@academia.com` | `aluno123` |

### Se o app abrir, mas o login der erro de conexão

1. Rode `ipconfig` no computador e encontre o IPv4 do adaptador Wi-Fi.
2. No navegador do celular, abra `http://IP_DO_PC:3333/health` usando o IPv4 encontrado. Se a página não abrir, confira se a API está rodando, se os dispositivos estão na mesma rede e se o firewall permite conexões na porta `3333` pela rede privada.
3. Se aparecer `{"status":"ok"}`, pare o Expo com `Ctrl+C` e execute os comandos abaixo no terminal de `mobile`, substituindo o endereço de exemplo pelo IPv4 do seu computador:

   ```powershell
   $env:EXPO_PUBLIC_API_URL = "http://192.168.1.10:3333"
   npx expo start --go
   ```

## Organização do projeto

| Diretório | Responsabilidade |
| --- | --- |
| `mobile/src/app` e `mobile/src/components` | Telas, navegação e componentes com React Native e Expo Router |
| `mobile/src/models` e `mobile/src/viewmodels` | Modelos e lógica de apresentação da arquitetura MVVM |
| `mobile/src/services` e `mobile/src/database` | Comunicação com a API e persistência local |
| `backend/src` e `backend/prisma` | API Express, regras de negócio, DAOs, esquema, migrações e seed |

O CRUD administrativo usa o SQLite do backend por meio da API. O SQLite do celular guarda fichas sincronizadas, suas marcações de execução e preferências. Após sincronizar, o aluno pode consultar fichas e marcar exercícios sem internet.

Veja o [README do backend](backend/README.md) para detalhes da API.
