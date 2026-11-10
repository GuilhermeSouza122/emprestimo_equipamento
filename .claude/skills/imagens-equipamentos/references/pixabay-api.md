# API do Pixabay: o que a skill usa

Fonte: `https://pixabay.com/api/docs/` (lida em 2026-11-10). Os termos completos de
licença (`/service/license-summary/`) não foram lidos pelo agente; o usuário deve conferi-los.

- **Busca:** `GET https://pixabay.com/api/` com `key` (obrigatória), `q` (até 100 caracteres),
  `image_type=photo`, `orientation=horizontal`, `safesearch=true`, `min_width`, `min_height`,
  `per_page` (3 a 200), `lang`.
- **URLs de imagem:** `previewURL` (150 px), `webformatURL` (640 px, vale 24 h),
  `largeImageURL` (1280 px, sem aprovação), `fullHDURL` e `imageURL` (exigem aprovação de acesso
  completo). A skill usa `largeImageURL`.
- **Redimensionar/recortar:** a API não faz. Por isso o `sharp` (ADR-003).
- **Limite:** 100 requisições por 60 s por chave; ao exceder, HTTP 429 (cabeçalho
  `X-RateLimit-Reset`). Resultados devem ser cacheados por 24 h (`.cache/`, ignorado pelo git).
- **Hotlinking:** o uso permanente das URLs do Pixabay não é permitido; as imagens são
  baixadas e guardadas por nós.
- **Autoria:** `user`, `user_id` e `pageURL` na resposta. Perfil:
  `https://pixabay.com/users/{user}-{user_id}/`.
- **Licença por imagem:** a API não devolve. A skill grava o texto fixo
  "Pixabay Content License" e o link do resumo da licença.
- **Atribuição:** a documentação pede, em tom de pedido, que se mostre a origem das
  imagens. Decisão do usuário: o catálogo não mostra crédito na tela (briefing, item 9);
  a autoria fica registrada em `creditos.json`. A licença completa do Pixabay não foi
  lida pelo agente; o usuário assume a conferência.
- **Aviso:** a chave só é obtida após login na conta do Pixabay; ela é do usuário.
