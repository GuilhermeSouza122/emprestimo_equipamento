# ADR-003 — Fonte, processamento e armazenamento das imagens de equipamentos

**Status:** aceito, confirmado pelo usuário em 2026-11-10

**Contexto do produto:** [docs/PRD.md](../PRD.md)
**Data:** 2026-11-10

## Contexto

O catálogo precisa mostrar uma foto por equipamento. O ADR-001 não decide fonte
de imagens, biblioteca de imagem nem armazenamento de arquivos, e deixa a
hospedagem como decisão futura. As imagens precisam ter origem rastreável,
tamanho uniforme (800×600), não repetir entre equipamentos e ficar acessíveis
por URL pública sem login.

O enunciado da prática previa o Pexels como fonte. O professor indicou o Pixabay
como alternativa (mensagem a ser anexada como evidência no `ENTREGA.md`).

## Decisão

| Item | Escolha |
|---|---|
| Fonte das imagens | API do Pixabay (`image_type=photo`), com chave na variável de ambiente `PIXABAY_API_KEY` |
| Processamento | `sharp`, como dependência de desenvolvimento, executado só no script local da skill, nunca no servidor da aplicação |
| Tamanho final | 800×600, com recorte centralizado, validado por script |
| Armazenamento | Bucket público do Supabase Storage, objeto nomeado pelo patrimônio |
| Créditos | Registro por imagem (id, autor, URL da página, licença) em arquivo versionado, sem segredos |
| Envio ao Storage do deploy | Executado pelo usuário; o agente só prepara os arquivos |

## Justificativa

- **Pixabay:** é a alternativa indicada pelo professor ao Pexels. A API devolve
  autor e página da imagem, o que sustenta o registro de créditos.
- **`sharp`:** o Pixabay não redimensiona nem recorta no servidor e só entrega
  tamanhos fixos, de proporção variável. Sem biblioteca de imagem, não há como
  garantir 800×600.
- **Só no script local:** `sharp` não entra no runtime da aplicação, então o
  ADR-001 (Next.js em Node, Prisma, tRPC) permanece intacto.
- **Supabase Storage:** o Pixabay não permite hotlinking permanente; as imagens
  precisam ser baixadas e hospedadas por nós. O bucket público serve a URL sem login.
- **Nome por patrimônio:** repetir o processo sobrescreve o mesmo objeto, sem duplicar.

## Alternativas descartadas

- **Pexels:** é a fonte do enunciado, mas o professor indicou o Pixabay.
- **Pedir o tamanho ao próprio provedor:** o Pixabay não tem parâmetro de recorte.
- **Redimensionar no navegador ou em `next/image`:** não garante o arquivo final
  em 800×600 nem o registro de créditos no momento da preparação.
- **Guardar as imagens no repositório (`public/`):** aumentaria o repositório e
  misturaria dado com código; o enunciado pede Storage.
- **Hotlink direto para o Pixabay:** não permitido pela documentação da API.
- **Guardar as imagens no PostgreSQL:** infla o banco e perde cache por URL.

## Consequências

- **O que fica mais fácil:** URLs públicas estáveis, tamanho uniforme garantido
  por script, créditos rastreáveis e processo repetível sem duplicar nada.
- **O que fica mais difícil:** nova dependência (`sharp`, de desenvolvimento),
  uma chave externa para gerenciar e um serviço a mais (Supabase) além do
  PostgreSQL do ADR-001.
- **O que fica impedido sem custo de mudança:** voltar a hospedar imagens fora
  do Storage, ou trocar de provedor de imagens, exige revisar este ADR e
  executar a skill de novo.
- **Revisão humana:** o Pixabay não filtra pessoas, marcas e texto legível; a
  skill depende de revisão visual do usuário.
- **Licença:** a API não devolve a licença por imagem; a skill grava o texto
  fixo da licença do Pixabay, cuja redação deve ser conferida pelo usuário.

## O que este ADR NÃO decide

Não decide o schema do banco (campo da URL da imagem), a tela do catálogo, o
nome do bucket nem a política de acesso detalhada do Storage, que ficam na spec
dos dados iniciais.

## Relação com o ADR-001

Não altera nenhuma escolha do ADR-001. O Supabase entra apenas como Storage, e
não substitui o PostgreSQL via Prisma, a autenticação nem a hospedagem.
