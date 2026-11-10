# Spec 002 — Tela de login

**Status:** interface solicitada em 2026-10-19. A autenticação real foi feita depois,
na [Spec 005](005-autenticacao.md), que substitui os trechos marcados abaixo.
Visual redesenhado conforme o layout Nocturne/EmpresTI (ver [Spec 003](003-layout-nocturne.md)
e [ADR-002](../adr/002-desing_system.md)); comportamento e critérios abaixo mantidos.

## Objetivo e vínculo

Criar a interface de entrada do Equipar em `/login`, como primeira etapa visual
do login previsto no [PRD](../PRD.md). Preservar a stack do
[ADR-001](../adr/001-stack.md) e seguir a linguagem visual do
[ADR-002](../adr/002-desing_system.md).

Hoje não há modelos de usuário/sessão nem autenticação implementada. Esta spec
cobre somente a tela e suas interações locais; não simula acesso autenticado.

## Escopo

- Página responsiva em modo escuro com marca EmpresTI, painel de apresentação
  (3 itens por pessoa, 14 dias úteis de prazo) e formulário, conforme a tela 01 do
  layout Nocturne.
- Campos de e-mail e senha com rótulos visíveis, preenchimento automático
  adequado e controle de mostrar/ocultar senha.
- Validação de campos obrigatórios e formato do e-mail, sem inventar restrições
  de senha que não foram definidas para o produto.
- ~~Aviso visível de que a autenticação ainda não está disponível.~~ **Substituído pela
  Spec 005:** com campos válidos, o formulário chama `auth.entrar`; em sucesso vai para
  `/catalogo`, em falha mostra "E-mail ou senha incorretos".
- Link de retorno à homepage e acesso "Entrar" no cabeçalho da homepage,
  preservando o acesso ao estado do sistema.
- CSS Modules, sem dependências novas, sem alteração no schema do banco.

## Critérios de aceitação

- **LOGIN-01:** `/login` exibe marca, título, campos de e-mail/senha, botão de
  entrada e aviso de autenticação indisponível.
- **LOGIN-02:** campos vazios e e-mail inválido não produzem uma tentativa de
  autenticação; mostrar/ocultar senha funciona por teclado sem submeter o form.
- **LOGIN-03:** ~~enviar dados válidos exibe feedback de indisponibilidade~~
  (substituído por AUTH-01 e AUTH-02 da Spec 005). Continuam valendo: as credenciais
  não vão na URL nem são registradas em logs ou no navegador, e sem JavaScript a tela
  não envia credenciais (o formulário fica desabilitado).
- **LOGIN-04:** os links entre homepage e login têm destinos reais. As seções
  atuais da homepage e seu acesso ao estado do sistema são preservados.
- **LOGIN-05:** em computador e celular, o formulário não apresenta rolagem
  horizontal, tem foco visível, rótulos associados e feedback acessível.
  O painel de apresentação também deve manter o texto legível, sem sobreposição.
  Até 960px, o painel passa para cima do formulário em uma coluna.

## Casos de erro e limites

- ~~Não exibir "senha incorreta" ou "usuário não encontrado" sem serviço real.~~ Agora há
  serviço real: a mensagem é sempre a genérica "E-mail ou senha incorretos", sem revelar
  se o e-mail existe (Spec 005, AUTH-02).
- Não adicionar "Lembrar de mim", cadastro, recuperação de senha, OAuth ou
  seleção de cargo sem definição dos respectivos comportamentos.
- Não usar credenciais reais nos testes ou em conteúdo de demonstração.

## Contratos e documentação afetados

Adicionar a rota de apresentação `/login`, sem endpoint de autenticação. A API
de produto permanece planejada com tRPC; o modelo futuro de sessão continua
aquele do ADR-001. Não criar um contrato REST alternativo para login.

Na implementação aprovada, atualizar a navegação e os limites documentados na
[Spec 001](001-homepage.md) para permitir o link à interface de login, sem
anunciar o fluxo de autenticação como implementado. Atualizar o README com essa
distinção.

## Plano e verificação

1. Seguir o pedido de implementação da tela, preservando o limite entre
   interface local e autenticação real.
2. Implementar a página, interações locais e estilos sem alterar a homepage
   além do acesso previsto; preservar alterações preexistentes do usuário.
3. Verificar conteúdo, navegação, formulário, feedback, senha oculta/visível e
   ausência de envio de credenciais, usando somente dados fictícios.
4. Executar lint, testes e build conforme `rules/checks.md`; fazer verificação
   visual em computador e celular quando houver navegador disponível.

Commit, push e deploy não fazem parte desta etapa sem autorização correspondente.
