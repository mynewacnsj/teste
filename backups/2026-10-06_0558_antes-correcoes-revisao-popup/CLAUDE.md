# Projeto — Landing de agência de marketing para contratistas (EUA)

## Regra de textura (persistente)

**Todo background sólido deste projeto recebe a textura da casa.** Duas camadas, sempre
nesta ordem, como filhas absolutas do elemento que carrega a cor:

1. **Grão** — `url(./grain.webp)` no `index.html` (`grain.png` só nos mockups), `background-size:256px 256px`, `background-repeat:repeat`
2. **Hachura 135°** — `repeating-linear-gradient(135deg, <linha> 0px, <linha> 1px, transparent 1px, transparent 4px)`

Ajuste por luminosidade do fundo:

| Fundo | Grão | Hachura |
|---|---|---|
| Escuro (`#0c0c0d`) | `opacity:.13` + `mix-blend-mode:screen` | linha `rgba(255,255,255,.055)` a `opacity:.22` |
| Claro (`#f4f1ea`) | `opacity:.085` + `mix-blend-mode:multiply` | linha `rgba(22,23,26,.021)`, sem opacity extra |
| Âmbar (`#e9a227`) | `opacity:.12` + `mix-blend-mode:multiply` | linha `rgba(12,12,13,.045)`, sem opacity extra |

Já aplicada em: hero, menu mobile (camada de chrome do header), faixa de transição
(desktop e mobile) e segunda dobra.

**Continuidade de fase:** quando dois elementos vizinhos precisam que a textura atravesse
a costura, ancore a origem de repetição no mesmo ponto. A faixa de transição tem 92px e a
camada de textura da seção usa `top:-92px`, então compartilham o mesmo espaço de repetição.

## Hero no mobile

Texto alinhado ao topo e hero com altura do conteúdo; imagem e véus presos à altura antiga
(`[data-av-heroimg]`, `[data-av-herolayer]`) para a foto não mudar. Não reduza o hero mexendo na imagem.

## Setas da segunda dobra

Removidas a pedido do cliente (sem setas na seção dos pilares). A última versão (linhas de
anotação animadas) está no commit 3f9caa8.

## Paleta

- Fundo escuro `#0c0c0d` · Fundo claro `#f4f1ea` · Texto escuro `#16171a`
- Âmbar `#e9a227` (hover `#f6bc4d`) · Âmbar sobre claro `#c98a12`
- Cartões `#ffffff`, borda `rgba(22,23,26,.09)`, raio 4px · Botões raio 2px

## Tipografia

- **Archivo** (500–800) — títulos, rótulos, números
- **Barlow** (400–600) — corpo de texto

## Layout

- Containers: `width:max(80%, min(100% - 2 * clamp(20px, 5vw, 88px), 1100px));margin:0 auto`
  (≥1400px → 80% exatos; ~1140–1400px → 1100px; abaixo → largura cheia menos gutter)
- Tetos de medida de leitura são independentes do container: headline 1060px, parágrafos 660–720px
- Larguras são medidas com `ResizeObserver` no próprio componente, **nunca** `window.innerWidth`
  (no preview o `innerWidth` reporta a largura do iframe)

## Máscaras SVG em data URI

O compilador reescreve nomes camelCase dentro de atributos. Percent-codifique as maiúsculas:
`view%42ox` e `preserve%41spect%52atio`. Sem isso o SVG perde o viewBox e a máscara quebra.
Não use `;` no data URI (`data:image/svg+xml,` sem `utf8`) — o parser de estilo divide em `;`.

## Backups (obrigatório)

**Antes de cada alteração**, rode `scripts/backup.sh "descricao curta"`: copia `index.html`,
`CLAUDE.md`, `README.md` e `docs/ARQUITETURA.md` para `backups/AAAA-MM-DD_HHMM_<descricao>/`.
Para voltar: copie o arquivo da pasta por cima do atual. Ver `backups/README.md`.

## Fundos por dobra

O site não terá um único fundo: algumas dobras usam cores complementares, como o claro `#f4f1ea`
(com a textura de fundo claro acima), alternando com o escuro `#0c0c0d`. Mesma identidade visual.

- 2ª dobra (escura, com as lavagens de luz âmbar): headline de depoimentos ("Clientes reales" / "Estuvieron donde
  tú estás hoy. Escúchalos." + linha de apoio) + carrossel + **Serviços** (`#servicios`).
  Os serviços ficam dentro da mesma `<section>`, logo após o carrossel (o cliente recusou fundo claro e âmbar
  para eles). Grão e hachura da seção cobrem a altura toda (`bottom:0`); a máscara das lavagens usa paradas
  em px (0/72/180/380px) para o topo não mudar quando a seção cresce.
  Layout dos serviços modelado na seção "Our services" de marroconstruction.adsconversion.online: eyebrow, H2 com
  destaque âmbar, barra âmbar, subheadline e grid 2×2 (1 coluna no mobile) de cards cinza-escuro `#16171a`
  (textura escura) com imagem 3:2, número em aba chanfrada, chip, tag, título, descrição, diferencial e CTA.
  Imagens em `media/servicios/`: as quatro são mockups
  próprios (`design/mockups/*.html` → `scripts/render-mockup.js` → WebP), editáveis.

## Carrossel de vídeos

- Fica no topo da segunda dobra; 6 vídeos em `REEL` no script do `index.html`.
- **Não usar o player do Wistia** (decisão do cliente: travava a página e atrasava as thumbs).
  Cards: `<video>` nativo mudo em loop com prévia curta local (`media/reel/<id>.mp4`) + poster WebP do 1º
  quadro; só toca o que está visível. Popup: `<video controls>` com o MP4 de `embed-ssl.wistia.com/deliveries`.
- Loop: 2 grupos iguais, cada um anima `translateX(-100%)` da própria largura. Não pausa.
- Play âmbar no estilo do Wistia, desenhado em CSS. Clique (camada transparente) abre o popup.
- Cards sem sombra. Bordas: degradê por `mask-image` no `.av-reel` (nunca camada opaca por cima — o
  fundo da seção tem brilho âmbar e uma camada pintada cria emenda).
- Mobile: 2 vídeos por linha. Popup 9:16, nunca tela cheia; `play()` dentro do clique (som no iOS).
- Nunca use `src="{{ … }}"` em `<img>`/`<video>` no template: o HTML cru é parseado antes do React e o
  navegador baixa a URL literal. Use `style="{{ objeto }}"` ou crie o elemento via JS.

## Desempenho (obrigatório manter)

- Sem CDN: React em `vendor/`, `support.min.js` (regerar com esbuild ao alterar `support.js`), fontes em `fonts/`
  com `@font-face` inline. Nunca voltar a usar Google Fonts nem unpkg.
- Hero: `<picture>` AVIF/WebP em `media/hero/` + `<link rel="preload" as="image" fetchpriority="high">` com o mesmo
  `media`/`srcset`. Se mudar um, mude o outro (senão a imagem baixa duas vezes).
- Logo: texto "Contractor Society" (Archivo 800 creme + "Society" âmbar espaçado), sem ícone.

## Publicação

GitHub Pages em https://mynewacnsj.github.io/teste/ a partir do branch `gh-pages`
(espelho do branch de desenvolvimento). `.nojekyll` na raiz é obrigatório.

## Idioma

Copy em **espanhol** (público: contratistas de remodelação nos EUA).
