# Revisão visual

O pré-filtro por tags não vê a imagem. Antes de aprovar, abra a `pageURL` de cada
proposta e confira. **Reprove** se houver qualquer um destes itens:

- **Pessoa:** rosto, corpo ou mão reconhecível, mesmo de relance ou desfocada ao fundo.
- **Marca ou logo legível:** em notebook, monitor, câmera, cabo, embalagem, mesa ou fundo.
- **Texto ou tela com conteúdo:** palavras legíveis, código, site, janela de sistema, documento.
  Tela apagada ou de cor lisa é aceita.
- **Não representa o equipamento:** a foto precisa mostrar o tipo do item (notebook, monitor,
  cabo, câmera/webcam). Evite ilustrações, mockups e composições com vários equipamentos.
- **Recorte ruim:** como a imagem é cortada ao centro para 800×600, o item precisa continuar
  inteiro e reconhecível no meio da foto.
- **Mesmo motivo visual repetido:** duas fotos quase iguais, mesmo de ids diferentes, confundem
  o catálogo; troque uma.

Cada reprovação vai para `data/imagens/reprovadas.json` com o id, o patrimônio e o motivo.
A contagem e os motivos alimentam a seção 4 do `ENTREGA.md`.
