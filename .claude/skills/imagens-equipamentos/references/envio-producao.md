# Envio ao Supabase do deploy (feito pelo usuário, nunca pelo agente)

O agente prepara `data/imagens/*.jpg` e `creditos.json`. Publicar no Storage do
deploy é uma ação sobre serviço remoto e exige a sua autorização e as suas
credenciais (`rules/restrictions.md`). Não existe script de envio nesta skill de propósito.

1. Rode `validar.mjs` e confirme `OK`.
2. No painel do Supabase do deploy, abra Storage e crie (ou use) o bucket público
   definido na spec de dados iniciais.
3. Envie os 12 arquivos `TI-00NN.jpg` pelo painel, com o mesmo nome do arquivo.
   Reenviar o mesmo nome substitui o objeto, sem duplicar.
4. Confira no navegador, sem login, se cada URL pública abre e tem 800×600.
5. Registre o que enviou e quando no `ENTREGA.md`.

Credenciais de escrita (service role) ficam só com você, fora do repositório e do agente.
