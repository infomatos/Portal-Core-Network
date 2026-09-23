# Portal Core Network Engineering

## Introducao

O Portal Core Network Engineering e um portal para centralizar informacoes, paineis, conteudos e processos ligados as frentes de NFV/Core Network.

Os principais pontos do portal sao:

- Orcamento: visao geral, realizacao NFV e Master Pivot.
- Aquisicoes: visao geral, status de RFX e orcamento RFX.
- Contratos: visao geral, busca de contratos, compromissos e OSS2Cloud.
- Projetos: visao geral, detalhamento e reuso de hardware.
- Demandas: visao geral, link para abertura de demanda e assistente baseado em planilha.
- Inventario: paginas de inventario por tipo.
- News, Newsletter e Forum: areas de comunicacao, publicacao de conteudo e registro de discussoes.
- Dashboard administrativo: gestao de usuarios, aprovacoes, noticias, newsletters, forum, Master Pivot e compromissos.

O portal foi pensado como uma aplicacao web unica, com front-end em React e back-end em Node.js/Express, usando banco MySQL para guardar usuarios, conteudos, uploads estruturados e registros operacionais.

## Estrutura geral do projeto

O repositorio esta separado em duas partes principais:

- `front/`: aplicacao web em React, TypeScript e Vite.
- `backend/`: API em Node.js, Express e TypeScript.

A estrutura segue uma divisao simples por responsabilidade:

- O front cuida das telas, rotas, layout, autenticacao no navegador e consumo das APIs.
- O backend concentra regras de autenticacao, permissoes, persistencia em banco, uploads, envio de e-mails e integracoes auxiliares.
- O banco MySQL armazena os dados persistentes.
- Alguns dados de apoio tambem ficam como arquivos estaticos no front, principalmente planilhas em `front/public/dados`.

Essa decisao arquitetonica deixa o portal relativamente simples de manter: cada area funcional tem suas paginas no front, suas rotas no backend e seus modelos de banco quando precisa persistir informacao.

## Banco de dados

O banco usado e MySQL, acessado pelo pacote `mysql2/promise`. A conexao fica em `backend/src/config/database.ts` e usa variaveis de ambiente:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

O pool de conexoes e criado com limite de 10 conexoes simultaneas. Isso evita abrir uma conexao nova a cada requisicao e melhora a estabilidade da API.

As tabelas sao criadas por migrations TypeScript em `backend/src/migrations`. Nao ha um orquestrador unico de migrations no projeto; cada script de migration e executado individualmente quando necessario.

Principais tabelas:

- `users`: usuarios do portal, com nome, matricula, e-mail, senha criptografada, perfil e status.
- `access_logs`: registro de logins e visitas de paginas.
- `pivot_uploads`: uploads do Master Pivot, com ano, rotulo, dados em JSON/texto e usuario responsavel.
- `compromissos_uploads`: uploads da area de compromissos, tambem armazenados como JSON/texto.
- `news`: noticias e artigos publicados no portal, incluindo slug, categoria, status, imagem de capa, PDF e contador de views.
- `forum_posts`: posts do forum, com data, participantes, topicos, conteudo, acoes e anexos.
- `newsletters`: newsletters criadas no editor, com corpo HTML/design e status de envio.
- `subscribers`: inscritos na newsletter.
- `email_queue`: fila de e-mails pendentes, enviados ou com falha.

Uma decisao importante foi misturar modelo relacional tradicional com campos `LONGTEXT` contendo JSON. Isso aparece em `pivot_uploads` e `compromissos_uploads`. Para dados tabulares importados de planilhas, essa abordagem facilita salvar o arquivo processado rapidamente, sem precisar criar muitas tabelas auxiliares.

## Backend

O backend fica em `backend/` e usa:

- Node.js
- Express
- TypeScript
- MySQL
- JWT para autenticacao
- bcrypt para senha
- multer para uploads
- nodemailer para envio de e-mails

O ponto de entrada e `backend/src/server.ts`.

Principais responsabilidades do backend:

- Inicializar o servidor HTTP.
- Configurar CORS e JSON com limite de tamanho.
- Servir uploads estaticos de newsletter, noticias e forum.
- Registrar rotas sob `/api`.
- Testar a conexao com o banco.
- Iniciar o worker de e-mails.

Rotas principais:

- `/api/auth`: login, cadastro, aprovacao de usuarios, perfil, troca e reset de senha, controle de acesso e logs.
- `/api/pivot`: leitura, upload e remocao de Master Pivot.
- `/api/compromissos`: leitura, upload e remocao de compromissos.
- `/api/newsletter`: newsletters, inscritos, uploads e envio.
- `/api/news`: noticias/artigos, imagens, PDFs, publicacao e consulta publica.
- `/api/forum`: forum publico e administracao de posts.
- `/api/demandas`: assistente de demandas baseado em Python.
- `/api/health`: checagem simples de saude da API.

A autenticacao usa JWT. O token e enviado pelo front no header `Authorization: Bearer ...`. O middleware `authMiddleware` valida o token e injeta os dados do usuario na requisicao. Existem validacoes por perfil, principalmente:

- `admin`
- `moderador`
- `editor`
- `user`

O envio de e-mails usa uma fila no banco. A aplicacao grava e-mails em `email_queue` e o worker `backend/src/workers/mailer.ts` verifica pendencias a cada 3 minutos. Essa decisao evita travar uma requisicao HTTP esperando o SMTP responder.

O assistente de demandas usa um script Python em `backend/python/demandas_agent.py`. O backend chama esse script via `spawn`, envia a pergunta por `stdin` e recebe a resposta em JSON por `stdout`. A base padrao e a planilha `front/public/dados/demandas.xlsx`, podendo ser alterada por `DEMANDAS_XLSX_PATH`.

## Front-end

O front fica em `front/` e usa:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TipTap para editor de noticias
- React Email Editor para newsletters
- xlsx para leitura de planilhas no navegador

O ponto de entrada e `front/src/main.tsx`. A aplicacao principal fica em `front/src/App.tsx`, que aplica o layout geral e carrega as rotas.

As rotas estao centralizadas em `front/src/routes/AppRoutes.tsx`. O menu principal esta em `front/src/config/navLinks.ts`.

O front foi estruturado em:

- `components/`: componentes reutilizaveis, como layout, menu, dashboard, rotas protegidas e editores.
- `pages/`: paginas por area de negocio, como orcamento, aquisicoes, contratos, projetos, demandas, inventario, news, forum e dashboard.
- `store/`: contexto de autenticacao.
- `hooks/`: hooks compartilhados, como registro de acesso.
- `services/`: servicos simples de API.
- `public/dados/`: planilhas usadas por funcionalidades do portal.

A autenticacao no front usa `AuthContext`, salvando token e usuario no `localStorage`. O proprio contexto verifica a expiracao do token e faz logout automatico quando o JWT vence.

As areas protegidas usam `ProtectedRoute`, com restricao por login e, em algumas rotas, por perfil. O dashboard administrativo tem areas exclusivas de `admin` e outras abertas tambem a `moderador`.

O front tambem incorpora relatorios Power BI por `iframe` em algumas paginas e consulta uma API interna via proxy `/grafana-api` durante o desenvolvimento.

## Hospedagem e ambientes

O projeto indica dois ambientes principais:

### Desenvolvimento

No desenvolvimento local:

- O backend roda na porta `3002`, conforme `backend/.env.example`.
- O front roda com Vite, normalmente em `http://localhost:5173`.
- O Vite encaminha chamadas `/api` para `http://localhost:3002`.
- O front usa `VITE_API_URL=/api` em `.env.development`.

Comandos principais:

```bash
cd backend
npm install
npm run dev
```

```bash
cd front
npm install
npm run dev
```

### Producao

No front, o arquivo `.env.production` define:

```env
VITE_API_URL=/api-cne
```

Isso indica que, em producao, o front chama a API por um caminho relativo chamado `/api-cne`, provavelmente publicado por um servidor web ou reverse proxy interno.

Tambem ha referencia ao caminho publico `/portalcorenetwork` em comentarios e configuracoes de URL do front. Com base no repositorio, o portal esta preparado para operar em ambiente interno TIM, com acesso a servicos internos como banco MySQL, relay SMTP e APIs internas.

O repositorio nao contem Dockerfile, pipeline CI/CD, script de deploy ou arquivo de configuracao do servidor web. Por isso, a hospedagem fisica exata deve ser confirmada no servidor de publicacao interno. O que o codigo mostra e:

- Front publicado como build estatico do Vite.
- Backend publicado como aplicacao Node.js compilada em `dist`.
- API exposta em producao pelo caminho `/api-cne`.
- Uploads servidos pelo proprio backend em rotas como `/uploads/newsletter`, `/uploads/news` e `/uploads/forum`.

Comandos esperados para build de producao:

```bash
cd backend
npm install
npm run build
npm start
```

```bash
cd front
npm install
npm run build
```

O resultado do front fica em `front/dist` e deve ser publicado no servidor web. O backend compilado fica em `backend/dist` e deve ser executado com as variaveis de ambiente de producao.

## Atualizacoes em dev e producao

Em desenvolvimento, o ciclo normal e:

1. Alterar codigo em `front/src` ou `backend/src`.
2. Rodar `npm run dev` no backend para reinicio automatico com nodemon.
3. Rodar `npm run dev` no front para hot reload do Vite.
4. Validar as telas e chamadas de API localmente.
5. Registrar a alteracao em Git.

Em producao, o ciclo esperado e:

1. Atualizar o codigo a partir da branch principal do repositorio.
2. Instalar dependencias quando houver mudanca em `package.json` ou `package-lock.json`.
3. Rodar build do backend com `npm run build`.
4. Rodar build do front com `npm run build`.
5. Publicar `front/dist` no servidor web.
6. Reiniciar ou recarregar o processo Node.js do backend.
7. Executar migrations necessarias manualmente, quando houver novas tabelas ou campos.
8. Validar `/api/health` e as principais paginas do portal.

Como nao ha pipeline automatizada no repositorio, esse processo aparenta ser manual ou administrado fora do codigo versionado.

## Versionamento

O projeto usa Git.

Branch atual:

- `main`

Remotes configurados:

- Azure DevOps: `portal-nfv`
- GitHub: `Portal-Core-Network`
- `origin`: GitHub `Portal-Core-Network`

Nao ha tags Git registradas no repositorio local no momento da avaliacao.

Versionamento dos pacotes:

- Backend: `version: 1.0.0`
- Front: `version: 0.0.0`

As dependencias estao travadas por `package-lock.json` em `backend/` e `front/`, o que ajuda a repetir instalacoes com as mesmas versoes.

Os ultimos commits indicam evolucoes como:

- reorganizacao de rotas e hook de registro de acesso;
- implementacao de inventario;
- ajustes em envio de e-mails e newsletter;
- assistente de pesquisa;
- limpeza de segredos/dependencias versionadas;
- commit inicial do Portal NFV.

Tambem existe versionamento funcional de alguns dados dentro do banco:

- Master Pivot guarda `year`, `label`, `uploaded_at` e `uploaded_by`.
- Compromissos guarda `label`, `uploaded_at` e `uploaded_by`.
- Noticias e forum trabalham com status `draft` e `published`.
- Newsletters trabalham com status `draft` e `sent`.

## Observacoes importantes

- Arquivos `.env` nao devem ser versionados, pois contem dados sensiveis.
- Uploads de usuarios ficam fora do Git, em `backend/uploads/`.
- O projeto nao possui testes automatizados configurados no momento.
- O script `backend/package.json` ainda tem `test` padrao sem testes reais.
- A documentacao de hospedagem pode ser refinada quando houver confirmacao do servidor web, processo de deploy e responsavel pela publicacao.
