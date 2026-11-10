# Entrega da prática

## Links
- Repositório (turma REST: back e front):
- Produção (Vercel):

## 1. Conflitos: o que foi pedido contra o que já existia
Todo pedido desta prática (briefings, requisitos, pedidos do time)
que contrariava o PRD, um ADR, uma rule, o conceito visto em sala ou
outro trecho do próprio enunciado.

| pedido | contrariava o quê | o que você fez | por quê | onde ficou registrado | commit |
|--------|-------------------|----------------|---------|-----------------------|--------|
| Briefing "solicitar empréstimo", item 4: quem já tem **5** empréstimos em aberto não pode solicitar outro | `docs/PRD.md:28` ("Cada pessoa pode estar com no máximo **3** itens ao mesmo tempo"), repetido na homepage (Spec 001, CA-02), na tela de login (Spec 002) e na Spec 003 | Mantive o limite de **3**. O briefing não foi seguido neste ponto. | O PRD é a fonte da regra de negócio (`AGENTS.md`, seção Precedência) e já definia o limite de 3 antes desta prática. As telas e specs existentes já comunicam "3 itens por pessoa". Um briefing é um pedido e não pode alterar regra de negócio sem aprovação e atualização do PRD. Usar 5 deixaria o sistema inconsistente com o que ele próprio informa ao usuário. | Spec de solicitar empréstimo (a criar) e este arquivo | ff1315b |
| Briefing "solicitar empréstimo", item 3: devolução prevista para **14 dias úteis** depois | `docs/PRD.md:29` dizia apenas "14 dias", sem falar em dias úteis | Segui o briefing e **alterei o PRD** para "14 dias úteis" (sem sábados, domingos e feriados de SP). | O PRD é a fonte da regra de negócio, então a mudança foi feita nele antes da spec, como exige o `AGENTS.md`. O briefing é o pedido mais recente e mais específico da regra. | `docs/PRD.md` (regras que Operações já decidiu) e spec de solicitar empréstimo (a criar) | ff1315b |
| Enunciado, contrato da skill: fonte de imagens **só a API do Pexels** | O professor indicou o **Pixabay** como alternativa (o Pexels foi considerado pago). | Usei o Pixabay como fonte. A skill e o ADR-003 seguem essa fonte. | A alternativa foi indicada pelo professor. O Pixabay não redimensiona, então 800×600 exige `sharp`, que, junto com o Supabase Storage, não estava no ADR-001. Por isso foi redigido o ADR-003 (proposto), sem adicionar dependência antes da aceitação. | `docs/adr/003-imagens-equipamentos.md` | 979b46d |
| Enunciado, seção 00: o sistema "já está no ar com login"; a prática só prevê as specs de dados iniciais e de solicitar empréstimo | `README.md`, Spec 002 e `prisma/schema.prisma`: o login é só interface, sem usuário, sessão ou autenticação (ADR-001 a decide, mas não está implementada). "Entrar com a senha padrão" e "colaborador logado" exigem login real | Criei uma spec própria de autenticação, a Spec 005, entre a de dados iniciais (004) e a de solicitar empréstimo. | Sem autenticação real o professor não consegue entrar nem o empréstimo ter um dono. Incluir isso na spec de dados misturaria dois assuntos; separar mantém cada spec verificável | `docs/specs/005-autenticacao.md` e `docs/specs/004-dados-iniciais.md` (pendência 1) | 979b46d |
| Enunciado, seção 03 (contrato da skill): a tela que exibe as fotos mostra "Fotos: Pexels" com link, "exigência das diretrizes da API" | Enunciado, seção 05 (briefing de solicitar empréstimo), item 9: "o catálogo deve ser limpo, sem rodapé nem texto de crédito" | Sem crédito na tela. Segui o item 9 do briefing e não exibi "Fotos: Pixabay" nem outro texto de crédito. | O crédito exigido era uma diretriz da API do Pexels, que deixou de ser a fonte: o professor indicou o Pixabay, cuja documentação trata a atribuição como pedido, não como exigência. O pedido do briefing é específico para o catálogo. Risco aceito: a licença completa do Pixabay não foi lida pelo agente; a conferência da licença fica pendente do usuário. | `docs/specs/006` (a criar: catálogo sem crédito); autoria registrada por imagem em `data/imagens/creditos.json` (autor, página, licença, id) | 6c20b04 |
| Briefing "dados iniciais", item 3: "TI-0004 e TI-0007 em manutenção; os outros 10 disponíveis" | A lista de equipamentos do enunciado (seção 03, "use exatamente esta"), que marca também o **TI-0010** (cabo de rede 3 m) como `manutencao`. Os dois trechos não podem valer juntos: 2 ou 3 itens em manutenção | **TI-0010 em manutenção**: 3 em manutenção (TI-0004, TI-0007, TI-0010) e 9 disponíveis. | A lista é o dado que o enunciado manda usar sem alterações e é mais específica que o texto do item 3, que resume o dado em palavras. Itens em manutenção não podem ser solicitados (PRD e Spec 003), então o professor vê o TI-0010 bloqueado na solicitação. | `docs/specs/004-dados-iniciais.md` (tabela de decisões, DADOS-02) e `data/equipamentos.json` | 979b46d, 6d10191 |
| Briefing "dados iniciais", item 5: deixar a senha padrão escrita no próprio arquivo que popula os dados | `rules/restrictions.md` ("não versione ... senhas") e o enunciado, seção 01 ("nenhuma senha, token ou chave em código ou no histórico do git") | A senha não está em nenhum arquivo. O seed a lê de `SEED_PROFESSOR_PASSWORD` (variável de ambiente) e grava só o hash `scrypt`. | Senha em código fica no histórico do git para sempre. Variável de ambiente cumpre a regra e ainda permite o login do professor. | `docs/specs/004-dados-iniciais.md` (escopo, DADOS-03, DADOS-06) | 979b46d, 6d10191 |

## 1b. Lacunas: o que foi pedido de forma incompleta
Tudo que você precisou decidir porque o pedido não dizia.
Cada decisão também está registrada na spec correspondente.

| spec | o que faltava | alternativas | o que decidiu | por quê | commit |
|------|---------------|--------------|---------------|---------|--------|
| solicitar empréstimo | Como contar os 14 dias úteis: quais dias pulam, quais feriados, qual fuso | (a) só pular sábado e domingo; (b) pular também feriados nacionais; (c) pular feriados nacionais, estaduais e municipais de SP | (c): pula sábado, domingo e feriados nacionais, do estado e do município de São Paulo; fuso America/Sao_Paulo | O sistema é usado em SP, e a lista de feriados reflete os dias em que Operações não atende. | ff1315b |
| solicitar empréstimo | O dia do empréstimo conta como dia 1 dos 14 dias úteis? | (a) conta; (b) não conta, o 1º dia útil é o seguinte | (b): o dia do empréstimo não conta, mesmo que seja fim de semana ou feriado | O PRD diz "a partir do dia do empréstimo" sem dizer se ele entra; assim um pedido no sábado ou em feriado funciona sem regra extra. Exemplo conferido em teste: 10/11/2026 vence em 01/12/2026 | 73f58c1 |
| solicitar empréstimo | O que é "empréstimo em atraso" | (a) vence hoje já é atraso; (b) só depois do dia da devolução prevista | (b): devolução prevista anterior a hoje (dia civil de São Paulo) | O PRD diz só "em atraso"; prazo até o fim do dia é o uso comum | 73f58c1 |
| solicitar empréstimo | Quem pode solicitar | (a) só colaborador; (b) qualquer usuário autenticado | (b): colaborador e Operações | O PRD só diz que o colaborador pede; quem é de Operações também é funcionário | 73f58c1 |
| solicitar empréstimo | Como garantir "dois pedidos ao mesmo tempo, só um é criado" e o limite com pedidos simultâneos | (a) índice único parcial no banco (o Prisma não o representa); (b) isolamento serializável com repetição; (c) trava da linha do usuário + atualização condicional do equipamento, numa transação | (c) | Não exige biblioteca nem recurso fora do Prisma e foi provado com testes de concorrência (Promise.all) repetidos | 73f58c1 |
| solicitar empréstimo | O que mostrar nas telas quando o dado não existe no banco (local, última devolução, histórico, botão Devolver) | (a) manter os campos de exemplo; (b) remover o que o banco não tem | (b): removidos; Operações continua com dados de exemplo e aviso | Dado fictício na tela do professor contradiria "zero empréstimos" | 73f58c1 |

## 2. Onde o agente tentou decidir por você
_(Rascunho escrito a partir do histórico da sessão; conferir antes de entregar.)_

1. **Escolha das fotos.** A primeira proposta do script escolhia o primeiro candidato
   sem pessoa/marca nas tags e já saía como "proposta". Ao olhar as folhas de contato,
   vi que várias eram erradas (xícara de café para o TI-0001, livro e óculos para o
   TI-0002, câmera Olympus com marca legível para o TI-0012). O que impediu o agente de
   seguir adiante foi o desenho da skill: toda proposta nasce `"pendente"` e só a
   aprovação do usuário a torna `"aprovada"`. Troquei as propostas ruins, mostrei as 12
   e o usuário aprovou. As 14 reprovadas estão em `data/imagens/reprovadas.json`.
2. **Contornar um bloqueio.** Ao diagnosticar por que as miniaturas saíam em branco,
   o agente tentou repetir o download com cabeçalhos de navegador (User-Agent e Referer)
   falsos. O harness bloqueou a ação como tentativa de contornar uma verificação
   anti-bot, e o agente não repetiu. A causa real era uma rajada de downloads sem
   intervalo; a correção foi esperar 400 ms entre eles (`preparar.mjs`).
3. **Valores que o agente colocou nas specs sem o enunciado dizer.** Nome de exibição
   "Marcelo Grilo", sessão de 8 horas, nome do bucket `equipamentos`, `TI-0010` em
   manutenção. Nenhum foi aplicado direto: entraram nas specs como "decisões a aprovar".
   O nome foi confirmado numa pergunta; o TI-0010 recebeu "sem preferência" na pergunta e
   só ficou fechado quando o usuário pediu "deixe o TI-0010 em manutenção".
4. **Recomendação que mudou.** O agente recomendou manter o Pexels sem `sharp`. Ao
   ler a documentação do Pixabay, viu que ele não recorta, e a recomendação mudou:
   `sharp` e Storage passaram a exigir ADR (seção 3).

## 3. Uma decisão que merece (ou não) um ADR
**Decisão:** fonte, processamento e armazenamento das imagens (Pixabay, `sharp`,
Supabase Storage). **Virou ADR:** sim, o [ADR-003](docs/adr/003-imagens-equipamentos.md),
aceito em 2026-11-10 (commit `979b46d`).

- **Por que merece ADR:** o ADR-001 não decide fonte de imagens, biblioteca de imagem nem
  armazenamento de arquivos, e deixa a hospedagem como decisão futura. As três escolhas
  trazem dependência nova (`sharp`) e um serviço externo (Supabase). O `rules/restrictions.md`
  exige aprovação para dependências e proíbe contrariar ADR aceito em silêncio.
- **Alternativas defensáveis:** Pexels com recorte pelo próprio provedor (sem `sharp`);
  imagens em `public/` no repositório; imagens no PostgreSQL; hotlink direto para o
  Pixabay (não permitido pela documentação da API).
- **Por que não ficou só na spec:** é uma escolha de arquitetura com custo de mudança
  (trocar provedor ou hospedagem obriga a refazer a skill e as URLs), e a Spec 004 e a
  skill dependem dela.
- **O que ficou sem ADR, de propósito:** o hash `scrypt` do `node:crypto`, o seed em
  JavaScript e a duração da sessão. São reversíveis, cabem no que o ADR-001 deixa em
  aberto e estão nas specs 004 e 005. Se o hash ganhar parâmetros que afetem outros
  sistemas, vale um ADR próprio.

## 4. A skill imagens-equipamentos
_(rascunho; completar com os números reais depois da revisão visual)_
- Local: `.claude/skills/imagens-equipamentos/`. No `SKILL.md` ficaram o fluxo e as
  regras inegociáveis (poucas, para o agente ler toda vez); em `references/` o que
  só se consulta quando preciso (API, critérios de revisão, envio manual); em
  `scripts/` tudo que precisa ser garantido sempre igual (tamanho, repetição,
  créditos, origem). Critério: o que pode ser verificado por máquina virou script.
- Código garante: fonte só Pixabay, 800×600 (sem ampliar), sem foto repetida (id e
  hash), créditos completos, idempotência. Instrução + revisão humana garantem:
  sem pessoa, marca ou texto legível (o código só faz triagem por tags).
- Agente impedido de enviar à produção: não existe script de envio; o agente não
  tem as credenciais de escrita do Supabase; o envio é manual (`references/envio-producao.md`).
  Ainda é só instrução: reforçar com regra de `deny` nas permissões (pendente).
- Fotos reprovadas na revisão visual: **14**, registradas com o motivo em
  `data/imagens/reprovadas.json`. Motivos: marca legível (Windows, Apple, Dell,
  Lenovo, Olympus, Rollei, Kodak: 7), pessoa na foto (1), não representava o item
  (xícara de café, livro e óculos, celular, 4), mistura de equipamentos (1) e
  enquadramento ruim/foto diferente do pedido (1). Dois desses descartes (TI-0001 e
  TI-0004) foram propostas que o usuário viu e pediu para trocar; os outros 12
  foram descartados pelo agente na triagem visual das folhas de contato, antes da
  aprovação das 12 finais pelo usuário.
- Resultado: 12 imagens 800×600 em `data/imagens/`, `validar.mjs` com `OK`,
  segunda execução de `preparar.mjs` sem alterar nada (idempotente).
- Envio ao Supabase (feito pelo usuário, nunca pelo agente): bucket público `equipamentos` com os 12
  arquivos. Conferido por requisição HTTP sem login em 2026-11-10: as 12 URLs públicas respondem 200
  `image/jpeg`, com o mesmo tamanho em bytes dos arquivos de `data/imagens/` (DADOS-07, parte de produção).
- Limites conhecidos: TI-0004 (item "em manutenção") mostra um notebook aberto, não
  fechado como a busca pedia; TI-0009 mostra um conector USB-A, não USB-C; TI-0006
  e TI-0007 são do mesmo autor e estilo parecido.
- Quais requisitos do contrato são garantidos por código e quais
  dependem de instrução ou de revisão humana. Por que essa divisão.
- Como o agente fica impedido de enviar imagens para produção.
- Fotos reprovadas na revisão visual: quantas e por quê.

## 5. O subagente verificador
Arquivo: `.claude/agents/verificador-specs.md` (commit `973df73`).
- **Como é acionado e por que esse gatilho:** pelo texto "Use SEMPRE antes de declarar
  qualquer spec pronta" no `description` do subagente (que permite delegação automática) e
  por uma regra sempre carregada: etapa 6 e seção "Verificação independente" de
  `rules/spec-flow.md`, item 4 de `AGENTS.md` e `rules/handoff.md` (commit `46eb3df`).
  Escolhi regra nos documentos que todo agente lê no início, em vez de depender de lembrança.
  **Limite honesto:** é instrução, não trava mecânica. Um hook de fim de tarefa seria mais
  forte e não foi feito.
- **O que ele lê e por quê:** AGENTS.md, restrictions, a spec, o PRD, os ADRs, checks, tests
  e o código, por conta própria. Recebe só o caminho da spec, para não herdar as conclusões
  de quem implementou (contexto limpo); herdar tornaria a conferência uma releitura do que o
  implementador já acredita.
- **O que ele não consegue fazer:** não tem `Edit` nem `Write` (`tools: Read, Grep, Glob, Bash`),
  então não altera arquivos nem corrige testes; a recusa do pedido do tech lead está na seção 1.
  **Lacuna:** o Bash não é restrito tecnicamente; a proibição de `migrate`, `seed` e escrita em
  banco está no prompt. Fechar com regras de `deny` nas permissões do harness continua pendente.
- **Monolito ou back/front:** este repositório é um monólito (Next.js full-stack, ADR-001),
  então um verificador cobre tudo: ele deriva os critérios da spec e roda `lint`, `test` e `build`,
  que alcançam servidor e telas.

## 6. O verificador em ação
- Histórico real: cada rodada que reprovou algo — o CA, a causa,
  a correção.
- Prova com erro plantado: o que você plantou, a tabela que voltou,
  e a confirmação de que o erro foi desfeito — com os dois commits.
- As tabelas finais das duas specs.

### Rascunho: Spec 004, rodada 1 (substituto do verificador)
O subagente `verificador-specs` não carregou na sessão em que foi criado (agentes novos
só aparecem em sessão nova). A rodada 1 foi feita por um agente de leitura, sem permissão
de editar, seguindo as instruções do arquivo do verificador. **Refazer com o verificador
de verdade numa sessão nova antes de entregar.**
- Resultado: DADOS-02 a DADOS-06 aprovados; DADOS-01, DADOS-07 (URL pública) e DADOS-08
  pendentes; nenhum reprovado.
- O que o verificador achou e eu corrigi: (1) `seed.mjs` imprimia a mensagem crua de erros
  do Prisma, que pode citar host e usuário do banco; agora mostra só tipo e código.
  (2) O teste de vazamento de credenciais era fraco; agora há um teste que roda o comando
  de verdade com um banco remoto falso e confere que nada vaza. (3) A redação do DADOS-06
  dizia "só como nome", mas o `.env.example` traz um valor de exemplo; a spec foi ajustada.
- Pendência dele que eu fechei: DADOS-01 (migrations do zero) foi aplicado por mim num banco
  descartável, depois removido; seed duas vezes, 12 equipamentos e 1 usuário.
- Ainda aberto: `npm audit --audit-level=high` acusa `next` (crítico), `vite`, `zod` e
  `source-map-js` (altos), anteriores a esta prática; exigem decisão explícita.
- Prova com erro plantado: feita, ver a próxima subseção.

### Prova com erro plantado (verificador de verdade, sessão nova)
- **O que plantei** (commit `900d31a`): em `prisma/seed-lib.mjs`, o `update` do seed passou a
  regravar a `situacao` de equipamento já cadastrado. Em produção isso desfaria um empréstimo
  em andamento a cada novo seed e viola o **DADOS-04**. Com o erro, o teste
  `nao altera a situacao de equipamento ja cadastrado` falha (1 falha, 18 passam).
- **Tabela que voltou** (resumo devolvido pelo `verificador-specs`, parecer REPROVADA):

| CA | Veredito | Resumo |
|----|----------|--------|
| DADOS-01 | Pendente | Migration e índices únicos certos. Falta aplicar `prisma migrate deploy` em PostgreSQL vazio e descartável (feito por mim fora do verificador, ver rodada 1) |
| DADOS-02 | Aprovado | 12 itens (4 notebooks, 3 monitores, 3 cabos, 2 câmeras); TI-0004, TI-0007 e TI-0010 em manutenção; testes passaram |
| DADOS-03 | Aprovado | Usuário do professor correto, hash `scrypt`, sem tabela de empréstimos |
| **DADOS-04** | **Reprovado** | `prisma/seed-lib.mjs:92-96` grava `situacao` no update de equipamento existente; `src/server/seed.test.ts:148-160` falhou com `expected 'disponivel' to be 'emprestado'` |
| DADOS-05 | Aprovado | Recusa banco remoto sem `--producao` e não imprime segredos |
| DADOS-06 | Aprovado | A senha só aparece como valor de exemplo no `.env.example` |
| DADOS-07 | Pendente | 12 imagens passaram no validador local; a URL pública sem login no Supabase é conferência manual do usuário |
| DADOS-08 | Pendente | Só se cumpre com o parecer APROVADA |

- **Confirmação do desfazer** (commit `c4d075d`, reverte `900d31a`): o seed voltou a não regravar
  a situação; a diferença de `prisma/` em relação ao estado anterior ao erro é vazia e os testes
  voltaram a 19 de 19. **Os dois commits:** erro `900d31a`, desfazer `c4d075d`.
- **Falta:** uma segunda rodada do verificador sobre o código já corrigido, com a tabela final
  da Spec 004 (e da Spec 006 quando existir). Só o parecer APROVADA permite dar a spec como pronta.

### Rodada do verificador de verdade: Specs 004 e 005 (sessão nova, 2026-11-10)
O `verificador-specs` carregado numa sessão nova rodou sobre as Specs 004 e 005. Nenhum critério de
comportamento foi reprovado. Resumo das tabelas devolvidas:

| Spec | Aprovados | Pendentes | Parecer |
|------|-----------|-----------|---------|
| 004 | DADOS-01 a 06, 08 (esta rodada) e 09 | DADOS-07 (URL pública em produção: parte manual; conferida por HTTP em 2026-11-10, ver Spec 004) | Pendente só pelo DADOS-07 |
| 005 | AUTH-01 a AUTH-09 | nenhum | **APROVADA** (segunda rodada, build OK) |
| 006 | EMP-01 a EMP-14 (todos) | nenhum | **APROVADA** (rodada posterior, com o build já liberado) |

- **Causa do build:** `EPERM` em `.next` (rmdir). Era um `next dev` que eu mantinha ligado na outra sessão, travando a
  pasta; não era erro de código. Com o servidor parado e `.next` removido, `npm run build` passa.
- **DADOS-01 / migrations do zero:** o verificador não cria banco. Criei um teste que faz isso
  (`src/server/migracoes.test.ts`, commit `fb19c6a`): banco descartável local, `migrate deploy`, tabelas e índices únicos conferidos,
  banco removido no fim. Passou a fazer parte de `npm test` (69 testes).
- **Achados do verificador sem ação:** o hash falso do login (AUTH-02) não tem teste de tempo de resposta;
  o proxy só confere a presença do cookie, e a validação real fica nas páginas e nos procedimentos (como a spec descreve).
- **Spec 006: APROVADA** pelo verificador (14 de 14, `npm run build` OK, 69 testes). Ressalvas dele: interface
  conferida só por leitura de código e `npm audit` decidido como risco aceito (seção 8).
- **Terceira rodada (Specs 004 e 005):** todos os critérios de comportamento aprovados, incluindo DADOS-01
  (agora coberto por `migracoes.test.ts`). O parecer continuou PENDENTE só por `npm run build`: `EPERM`
  em `.next/static`. Como o projeto está dentro do OneDrive, que segura arquivos, não dá para separar
  bloqueio do OneDrive de um `next dev` aberto. Mitigação: script `prebuild` (`scripts/limpar-next.mjs`)
  que remove `.next` com repetição; dois builds seguidos passaram. Se voltar, pausar a sincronização do
  OneDrive nesta pasta ou mover o projeto para fora dele.
- **Lacunas leves apontadas na Spec 005 e corrigidas:** (1) `criarContexto` só lançava o erro de
  `SESSION_SECRET`; agora registra o motivo no log, sem o valor, com teste; (2) a proteção das páginas
  (`dal.ts`) só tinha leitura de código; agora tem `dal.test.ts` (sem cookie, cookie inválido, sessão
  revogada, colaborador e Operações); (3) o texto "recusado no servidor" foi esclarecido (redireciona na
  página e devolve `FORBIDDEN` na API).
- **Segunda rodada, depois das correções:** Spec 005 **APROVADA** (AUTH-01 a AUTH-09; `lint`, 77 testes e
  `npm run build` OK). Spec 004 com todos os critérios aprovados, inclusive DADOS-01 e DADOS-08 desta rodada;
  o parecer ficou PENDENTE só no DADOS-07, que o verificador atribui ao usuário. A prova (12 URLs públicas
  respondendo 200, mesmo tamanho dos arquivos) está na Spec 004 com o comando para repeti-la. Os testes
  passaram de 69 para 77 porque acrescentei `contexto.test.ts` e `dal.test.ts` entre as rodadas.
- **Aberto:** uma rodada curta do verificador na Spec 004, pedindo que ele rode os `curl -I` da Spec, para o
  DADOS-07 sair de PENDENTE; e o que depende do usuário (push, migrations e seed no deploy, variáveis na Vercel).

## 7. Uma regra sua que esta prática pôs à prova
**`rules/spec-flow.md` não exigia nenhuma verificação independente.** Ela mandava implementar,
testar e entregar; nada impedia o mesmo agente de implementar e declarar a spec pronta. A
prática exigia exatamente o contrário ("nenhuma spec é declarada pronta sem passar pelo
verificador"). **O que mudei:** etapa 6 e seção "Verificação independente" no `spec-flow.md`,
item 4 no `AGENTS.md` e a tabela do verificador no `handoff.md` (commit `46eb3df`).

Outros pontos que a prática expôs, sem mudar a rule ainda:
- O enunciado cita um `rules/secrets.md` que não existe aqui; a proibição de segredos está só em
  `restrictions.md` ("Segurança"). A regra cobre o caso, mas não nomeia o caso do seed com senha
  padrão, que é onde o briefing pediu o contrário.
- Os `rules` não dizem como tratar um pedido (briefing) que contraria o PRD. O `AGENTS.md` diz
  que o briefing não é fonte de regra, mas a prática mostrou que falta um passo explícito:
  levantar, decidir e registrar.

## 8. O que ficou de fora e o que faria diferente
**Ficou de fora:**
- **Specs 005 e 006 implementadas, mas sem verificação independente.** Falta rodar o `verificador-specs`
  (só carrega em sessão nova) sobre as Specs 004, 005 e 006 e anexar as tabelas finais à seção 6.
- **Sem devolução.** Um item emprestado continua assim, então o estoque de teste é consumido (9 itens
  disponíveis); liberar itens em produção é ação do usuário no banco. Operações segue com dados de exemplo.
- Rodar o seed no banco do deploy e enviar as imagens ao Supabase: ações do usuário, fora do agente.
- Rodar o `verificador-specs` de verdade (ele só carrega em sessão nova) e a prova com erro plantado.
- Leitura da licença completa do Pixabay; o catálogo ficou sem crédito na tela por decisão do usuário.
- **Decisão sobre o `npm audit` (2026-11-10): risco aceito pelo usuário, sem atualizar dependências.**
  `rules/checks.md` pede correção ou decisão explícita, e proíbe atualização forçada. Os alertas são
  anteriores a esta prática e nenhuma dependência nova os introduziu (`sharp` e `@trpc/*` não aparecem).
  Alternativas: atualizar `next` para 16.4.6 (mesma versão major) e rodar `npm audit fix` sem `--force`;
  ou aceitar. Foi escolhido aceitar. Justificativa por alerta:
  - `next` (3 alertas, 1 crítico de RCE em otimização de imagem com SVG, 1 crítico de RCE em funções
    `use cache`, 1 alto de DoS com Server Actions): o projeto não usa `next/image`, SVG nem configuração de
    imagens (fotos são `<img>` com URL do Supabase), não usa `use cache` nem Server Actions (busca no
    código sem ocorrências). Risco reduzido, **não zero**: é a única parte que roda em produção.
  - `zod` (alto, DoS por memória): só entra por `eslint-config-next` (ferramenta de lint); o app não
    importa `zod` (as validações são funções próprias).
  - `vite` (alto): só entra por `vitest` (testes, ambiente de desenvolvimento); o servidor do Vite não é
    executado nem exposto.
  - `source-map-js` (alto, DoS): entra pelo `postcss` do `next`, em tempo de build, não em execução.
  **Reavaliar** antes de qualquer uso real além da correção (por exemplo, ao ativar `next/image`,
  Server Actions ou `use cache`) ou ao atualizar o Next, que é a correção recomendada.
- Gatilho mecânico (hook) e trava de comandos de banco nas permissões do harness.
- Pequenos desvios nas fotos: TI-0004 mostra notebook aberto (não fechado), TI-0009 é USB-A.

**O que faria diferente:**
- Ler o enunciado inteiro procurando conflitos antes de escolher a fonte das imagens, em vez de
  recomendar o Pexels sem ter lido a documentação.
- Criar o subagente verificador em uma sessão anterior ao uso, porque agentes só carregam no início.
- Subir o banco local no começo. Descobrir o Docker desligado atrasou os testes.
- Escrever a spec de autenticação junto com a de dados iniciais, já que uma depende da outra.
