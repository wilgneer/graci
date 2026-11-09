# Painel de textos (admin)

Página `admin.html` para a Graci trocar **os textos** do site sem mexer em código e **sem banco de dados**.

## Como funciona

```
index.html  ──(cada texto editável tem data-cms="chave")
content.json ──(só os textos que foram alterados: { "chave": "novo texto" })
cms.js      ──(no site: lê o content.json e troca os textos)
admin.html + admin.js + admin.css ──(o painel)
```

- O texto original continua dentro do `index.html`. Se o `content.json` não existir ou estiver vazio, o site mostra o original.
- O painel descobre sozinho os campos lendo o `index.html` (atributos `data-cms`, `data-cms-label`, `data-cms-group`).
- Ao clicar em **Publicar no site**, o painel grava o `content.json` no repositório via API do GitHub (um commit na `main`). O GitHub Pages republica em ~1–2 min.

## Login

Não há senha própria: o "login" é uma **chave (fine-grained token) do GitHub** com permissão só neste repositório.

Criar a chave (uma vez): GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens →
Repository access = só `graci`; Permissions → Contents = **Read and write**.

A chave fica na sessão do navegador (ou no computador, se marcar "Lembrar"). Quem não tem a chave não consegue alterar nada, mesmo abrindo o `/admin.html`.

## Sintaxe nos campos

| Digitar | Resultado |
|---|---|
| `*palavra*` | dourado (só nos campos com esse destaque) |
| `**palavra**` | negrito |
| Enter | nova linha |
| campo vazio | volta ao texto original |

## Adicionar um texto novo à lista do painel

No `index.html`, no elemento desejado:

```html
<h2 data-cms="secao.titulo" data-cms-label="Título" data-cms-accent="span">...</h2>
```

- `data-cms` — chave única (obrigatório)
- `data-cms-label` — nome mostrado no painel
- `data-cms-accent` — `accent` | `span` | `em` se o campo aceita destaque dourado `*...*` (qual tag usar)
- `data-cms-attr="placeholder"` — para editar um atributo em vez do texto
- `data-cms-group="Nome da seção"` — no elemento pai/seção, agrupa os campos no painel

## Limites

- Só textos (não troca imagens, cores, links nem WhatsApp).
- Não adiciona/remove itens de lista; edita os itens que existem.
- O repositório e a branch estão fixos no topo do `admin.js` (`OWNER`, `REPO`, `BRANCH`).
