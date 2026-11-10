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
| Briefing "solicitar empréstimo", item 4: quem já tem **5** empréstimos em aberto não pode solicitar outro | `docs/PRD.md:28` ("Cada pessoa pode estar com no máximo **3** itens ao mesmo tempo"), repetido na homepage (Spec 001, CA-02), na tela de login (Spec 002) e na Spec 003 | Mantive o limite de **3**. O briefing não foi seguido neste ponto. | O PRD é a fonte da regra de negócio (`AGENTS.md`, seção Precedência) e já definia o limite de 3 antes desta prática. As telas e specs existentes já comunicam "3 itens por pessoa". Um briefing é um pedido e não pode alterar regra de negócio sem aprovação e atualização do PRD. Usar 5 deixaria o sistema inconsistente com o que ele próprio informa ao usuário. | Spec de solicitar empréstimo (a criar) e este arquivo | _(preencher com o hash)_ |
| Briefing "solicitar empréstimo", item 3: devolução prevista para **14 dias úteis** depois | `docs/PRD.md:29` dizia apenas "14 dias", sem falar em dias úteis | Segui o briefing e **alterei o PRD** para "14 dias úteis" (sem sábados, domingos e feriados de SP). | O PRD é a fonte da regra de negócio, então a mudança foi feita nele antes da spec, como exige o `AGENTS.md`. O briefing é o pedido mais recente e mais específico da regra. | `docs/PRD.md` (regras que Operações já decidiu) e spec de solicitar empréstimo (a criar) | _(preencher com o hash)_ |
| Enunciado, contrato da skill: fonte de imagens **só a API do Pexels** | O professor indicou o **Pixabay** como alternativa (o Pexels foi considerado pago). Evidência: _(anexar a mensagem do professor, com data)_ | Usei o Pixabay como fonte. A skill e o ADR-003 seguem essa fonte. | A alternativa foi indicada pelo professor. O Pixabay não redimensiona, então 800×600 exige `sharp`, que, junto com o Supabase Storage, não estava no ADR-001. Por isso foi redigido o ADR-003 (proposto), sem adicionar dependência antes da aceitação. | `docs/adr/003-imagens-equipamentos.md` | _(preencher com o hash)_ |

| Enunciado, seção 00: o sistema "já está no ar com login"; a prática só prevê as specs de dados iniciais e de solicitar empréstimo | `README.md`, Spec 002 e `prisma/schema.prisma`: o login é só interface, sem usuário, sessão ou autenticação (ADR-001 a decide, mas não está implementada). "Entrar com a senha padrão" e "colaborador logado" exigem login real | Criei uma spec própria de autenticação, a Spec 005, entre a de dados iniciais (004) e a de solicitar empréstimo. | Sem autenticação real o professor não consegue entrar nem o empréstimo ter um dono. Incluir isso na spec de dados misturaria dois assuntos; separar mantém cada spec verificável | `docs/specs/005-autenticacao.md` e `docs/specs/004-dados-iniciais.md` (pendência 1) | _(preencher com o hash)_ |

| Enunciado, seção 03 (contrato da skill): a tela que exibe as fotos mostra "Fotos: Pexels" com link, "exigência das diretrizes da API" | Enunciado, seção 05 (briefing de solicitar empréstimo), item 9: "o catálogo deve ser limpo, sem rodapé nem texto de crédito" | Sem crédito na tela. Segui o item 9 do briefing e não exibi "Fotos: Pixabay" nem outro texto de crédito. | O crédito exigido era uma diretriz da API do Pexels, que deixou de ser a fonte: o professor indicou o Pixabay, cuja documentação trata a atribuição como pedido, não como exigência. O pedido do briefing é específico para o catálogo. Risco aceito: a licença completa do Pixabay não foi lida pelo agente; a conferência da licença fica pendente do usuário. | `docs/specs/006` (a criar: catálogo sem crédito); autoria registrada por imagem em `data/imagens/creditos.json` (autor, página, licença, id) | _(preencher com o hash)_ |

| Briefing "dados iniciais", item 3: "TI-0004 e TI-0007 em manutenção; os outros 10 disponíveis" | A lista de equipamentos do enunciado (seção 03, "use exatamente esta"), que marca também o **TI-0010** (cabo de rede 3 m) como `manutencao`. Os dois trechos não podem valer juntos: 2 ou 3 itens em manutenção | **TI-0010 em manutenção**: 3 em manutenção (TI-0004, TI-0007, TI-0010) e 9 disponíveis. | A lista é o dado que o enunciado manda usar sem alterações e é mais específica que o texto do item 3, que resume o dado em palavras. Itens em manutenção não podem ser solicitados (PRD e Spec 003), então o professor vê o TI-0010 bloqueado na solicitação. | `docs/specs/004-dados-iniciais.md` (tabela de decisões, DADOS-02) e `data/equipamentos.json` | _(preencher com o hash)_ |
| Briefing "dados iniciais", item 5: deixar a senha padrão escrita no próprio arquivo que popula os dados | `rules/restrictions.md` ("não versione ... senhas") e o enunciado, seção 01 ("nenhuma senha, token ou chave em código ou no histórico do git") | A senha não está em nenhum arquivo. O seed a lê de `SEED_PROFESSOR_PASSWORD` (variável de ambiente) e grava só o hash `scrypt`. | Senha em código fica no histórico do git para sempre. Variável de ambiente cumpre a regra e ainda permite o login do professor. | `docs/specs/004-dados-iniciais.md` (escopo, DADOS-03, DADOS-06) | _(preencher com o hash)_ |

## 1b. Lacunas: o que foi pedido de forma incompleta
Tudo que você precisou decidir porque o pedido não dizia.
Cada decisão também está registrada na spec correspondente.

| spec | o que faltava | alternativas | o que decidiu | por quê | commit |
|------|---------------|--------------|---------------|---------|--------|
| solicitar empréstimo | Como contar os 14 dias úteis: quais dias pulam, quais feriados, qual fuso | (a) só pular sábado e domingo; (b) pular também feriados nacionais; (c) pular feriados nacionais, estaduais e municipais de SP | (c): pula sábado, domingo e feriados nacionais, do estado e do município de São Paulo; fuso America/Sao_Paulo | O sistema é usado em SP, e a lista de feriados reflete os dias em que Operações não atende. | _(preencher com o hash)_ |

## 2. Onde o agente tentou decidir por você
Pelo menos um momento em que o agente assumiu algo que não estava
escrito. Como você percebeu e o que fez.

## 3. Uma decisão que merece (ou não) um ADR
Escolha uma decisão desta prática com alternativa defensável.
Ela virou ADR? Por quê — ou por que não?

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
- Limites conhecidos: TI-0004 (item "em manutenção") mostra um notebook aberto, não
  fechado como a busca pedia; TI-0009 mostra um conector USB-A, não USB-C; TI-0006
  e TI-0007 são do mesmo autor e estilo parecido.
- Quais requisitos do contrato são garantidos por código e quais
  dependem de instrução ou de revisão humana. Por que essa divisão.
- Como o agente fica impedido de enviar imagens para produção.
- Fotos reprovadas na revisão visual: quantas e por quê.

## 5. O subagente verificador
- Como ele é acionado e por que esse gatilho (e não outro).
- O que ele lê e por que precisa ler, em vez de herdar.
- O que ele não consegue fazer e como isso é garantido no seu harness.
- Monolito ou back/front: como a verificação cobre o seu caso.

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
- Prova com erro plantado: ainda não feita.

## 7. Uma regra sua que esta prática pôs à prova
Uma rule, ADR ou instrução que se mostrou incompleta, errada ou em
conflito com o que a prática pedia. O que aconteceu e o que você mudou.

## 8. O que ficou de fora e o que faria diferente
