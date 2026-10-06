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

Já aplicada em: hero, menu mobile (camada de chrome do header), segunda dobra, 3ª dobra (folha clara,
estimates, total escuro, fita âmbar), 4ª dobra, cards/documento/formulário, footer, barra mobile e páginas legais.

**Como aplicar:**
- Fundo de **seção escura**: wrapper `aria-hidden` absoluto com `overflow:hidden` (nunca na `<section>`, senão o
  sticky morre) contendo `<div data-av-grain>` + `<div data-av-hatch>` — o `_paint` ajusta as opacidades
  (.115/.2 desktop, .075/.13 abaixo de 760px).
- Superfície **clara, âmbar ou card**: SEMPRE por classe — `<span class="av-tex-l|av-tex-a|av-tex-d" aria-hidden="true">`
  como 1º filho de uma superfície com `position:relative;isolation:isolate`. **Nunca** `data-av-grain`/`data-av-hatch`
  aí: o `_paint` repinta todos eles com valores de fundo escuro. Onde não cabe um span (ex.: dentro de `<dl>`), use
  `::before`/`::after` na própria superfície, como `.av-sv-card` e `.av-ns-fact`.
- Botões, abas, chips, etiquetas, carimbos e tiras com menos de 44px ficam lisos.

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
- Âmbar `#e9a227` (hover `#f6bc4d`) · Âmbar sobre claro: `#c98a12` **só em grafismo** (fios, ticks, marcadores — reprova
  como texto) e `--av-amber-ink #8f5d07` para **texto** âmbar pequeno sobre claro
- Tintas sobre claro: corpo `rgba(22,23,26,.72)`, notas `.62` (nunca abaixo). Creme sobre escuro nunca abaixo de `.5`.
  Erro `#b3261e`. Tokens em `:root` (`--av-*`) no `<style>` do helmet.
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

O site alterna escuro `#0c0c0d` e claro `#f4f1ea` (mesma identidade visual):

1. **Hero** escuro.
2. **2ª dobra** escura (lavagens de luz âmbar): headline de depoimentos ("Clientes reales" / "Estuvieron donde
  tú estás hoy. Escúchalos." + linha de apoio) + carrossel + **Serviços** (`#servicios`).
  Os serviços ficam dentro da mesma `<section>`, logo após o carrossel (o cliente recusou fundo claro e âmbar
  para eles). Grão e hachura da seção cobrem a altura toda (`bottom:0`); a máscara das lavagens usa paradas
  em px (0/72/180/380px) para o topo não mudar quando a seção cresce.
  Layout dos serviços modelado na seção "Our services" de marroconstruction.adsconversion.online: eyebrow, H2 com
  destaque âmbar, barra âmbar, subheadline e grid 2×2 + card 05 "Sitios web" em largura total (1 coluna no mobile) de cards cinza-escuro `#16171a`
  (textura escura) com imagem 3:2, número em aba chanfrada, chip, tag, título, descrição, diferencial e CTA.
  Cards com âncoras `#meta-ads`, `#social-media`, `#estimates`, `#seo-ia`, `#sitios-web` (usadas no footer e na FAQ).
  Imagens em `media/servicios/`: as cinco são mockups
  próprios (`design/mockups/*.html` → `scripts/render-mockup.js` → WebP), editáveis.
3. **3ª dobra** `#resultados` **clara** — a «folha»: corte reto contra a 2ª, régua de 18px no topo, métricas com a
  fórmula de cada número, 3 casos em formato de estimate (miniatura 9:16 abre o MESMO popup do carrossel),
  **Proceso** `#proceso` com cotas e fita métrica âmbar (vertical abaixo de 960px) e fecho com botão escuro.
  Sai por um picote + «mordidas» de 6px na cor da 4ª. Casos usam os vídeos `qtq97pqw42`, `85xxi41ehr` e
  `j9kq9ph7rs`; **nunca** `u3z5opwfg5` (mostra o nome de uma empresa real).
4. **4ª dobra** escura (`.av-ed`, sem lavagem no topo): **Nosotros** `#nosotros` (moldura de foto com monograma «CS»
  enquanto não houver foto real — nunca foto de banco), **Así trabajamos** (documento `#16171a` com 5 regras),
  **Preguntas** `#preguntas` (`<details>` independentes) e **CTA** `#agendar` (a lavagem âmbar fica só aqui) com o
  formulário em papel claro.
5. **Footer** escuro com filete de 1px e wordmark gigante. **Barra fixa mobile** por cima (0–899px).

Todos os CTAs apontam para `#agendar`. Dados provisórios levam `data-av-tbd="o que trocar"`; abra a página com
`?prov` para contorná-los. A prop `datosDeEjemplo` (default `true`) liga os carimbos «Cifras de ejemplo»; só passe
para `false` com todos os números reais e autorizados.

## Formulário e agenda (#agendar)

- 2 passos na mesma célula de grid (o cartão tem a altura do maior; trocar de passo não desloca a página):
  1) código postal + especialidade → 2) nome, WhatsApp/telefone, ticket, consentimento TCPA (nunca pré-marcado),
  honeypot `empresa_web`; 3) sucesso. Inputs NÃO controlados; erros, `aria-invalid`, `inert` e carregamento vão
  direto no DOM. Validação só no envio de cada passo, depois revalida ao digitar.
- Configuração em `CFG` (topo do script): `formEndpoint`/`formNoCors`, `whatsapp`, `phoneDisplay`/`phoneHref`, `email`,
  `calendarUrl` (marcadores `{nombre} {telefono} {cp} {especialidad} {ticket}`) e `calendarMode` (`modal`|`tab`),
  `zonasOcupadas`/`zonasAlDia`, `horario`, `estados`, `llc`, `ciudadEquipo`, `sellos`, `redes`. Os valores atuais são
  de EXEMPLO (555-01xx, example.com).
- Envio (`_formSubmit`, tudo síncrono até a 1ª ação externa): endpoint + agenda → POST em segundo plano e agenda no
  mesmo clique; só endpoint → espera até 8 s, falha vira botão «Enviar por WhatsApp» (novo clique); sem endpoint →
  WhatsApp com a mensagem pronta; só agenda; só e-mail (`mailto`); nada configurado → modo de teste.
- Modal da agenda `[data-av-cal]`: iframe criado só no clique e mantido para reabrir; link «abrir em outra aba»;
  foco preso por sentinelas; Esc fecha a agenda antes do vídeo.

## Barra fixa mobile

`[data-av-mbar]` abaixo de 900px (o ponto do hambúrguer). Só `IntersectionObserver` (nenhum scroll listener):
aparece depois do hero, some ao chegar no `#agendar` e continua oculta no footer; some também com menu, vídeo ou
agenda abertos. As flags ficam na instância (`this._mb`), sem `setState`; `_syncMbar` escreve `data-show`,
`aria-hidden` e `inert` no DOM.

## Revelação no scroll

`[data-av-rv]` (`""` sobe 18px + fade, `"fade"`, `"none"` = só gatilho) com atraso por `data-av-rv-d="1..6"`
(vira `--rv-d`, passos de 90ms). Um único `IntersectionObserver` (`_mountReveal`) marca `[data-in]`. Estados
ocultos SEMPRE sob `html.av-js …:not([data-in])` — sem IO ou com `prefers-reduced-motion` a classe `av-js` não entra
e tudo nasce visível. Animações internas encadeadas por ancestral (`.av-rs-case[data-in] .av-stamp--9`). Elemento
encostado no fim da página não serve de gatilho (cai na margem de −8% do observer): use o vizinho de cima, como o
wordmark do footer usa `.av-ft-legal`.

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
- O mesmo popup abre a partir das miniaturas dos casos da 3ª dobra (`[data-av-case-play]`, clique delegado):
  a origem do FLIP é a `.av-rs-thumb`; o degradê das bordas (`edgeAlpha`) só vale dentro do carrossel.
- Abertura/fechamento do popup: transição de elemento compartilhado (card → moldura → card) em Web Animations,
  véu, brilho, filete e rótulo em sequência; carrossel congela enquanto aberto. Detalhes em docs/ARQUITETURA.md.
  **Só animar transform e opacity** (nada de box-shadow, border-radius, letter-spacing, transform-origin em keyframes
  nem backdrop-filter): é o que mantém o motion liso em celular fraco.
- Nunca use `src="{{ … }}"` em `<img>`/`<video>` no template: o HTML cru é parseado antes do React e o
  navegador baixa a URL literal. Use `style="{{ objeto }}"` ou crie o elemento via JS.

## Desempenho (obrigatório manter)

- Sem CDN: React em `vendor/`, `support.min.js` (regerar com esbuild ao alterar `support.js`), fontes em `fonts/`
  com `@font-face` inline. Nunca voltar a usar Google Fonts nem unpkg.
- Hero: `<picture>` AVIF/WebP em `media/hero/` + `<link rel="preload" as="image" fetchpriority="high">` com o mesmo
  `media`/`srcset`. Se mudar um, mude o outro (senão a imagem baixa duas vezes).
- Logo: texto "Contractor Society" (Archivo 800 creme + "Society" âmbar espaçado), sem ícone.
- Dobras novas sem imagem nova: miniaturas dos casos e da ponte reusam os pôsteres de `media/reel/`; iframe da
  agenda só no clique; fetch/WhatsApp só no envio. Foto da equipe/estrategista só por prop (`fotoEquipo`,
  `fotoEstratega`), `<img>` criado por JS, lazy, AVIF/WebP ≤120 KB.
- O subconjunto das fontes NÃO tem `→ ← ✓ ≈`: setas e checks são SVG inline.
- Nomes de classe: o contêiner do CTA é `.av-ag-in`; os campos do formulário são `.av-ag-input` (não reaproveite nomes).

## Publicação

GitHub Pages em https://mynewacnsj.github.io/teste/ a partir do branch `gh-pages`
(espelho do branch de desenvolvimento). `.nojekyll` na raiz é obrigatório.

## Idioma

Copy em **espanhol** (público: contratistas de remodelação nos EUA).
