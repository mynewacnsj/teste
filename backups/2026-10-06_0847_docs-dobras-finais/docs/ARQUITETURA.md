# Arquitetura, lógica e design do site

Landing page de uma **agência de marketing para contratistas de remodelação/construção nos EUA**.
Copy em **espanhol** (público hispânico). Proposta: gerar e *filtrar* leads de alto ticket para que
o contratista só fale com quem está pronto para fechar.

O projeto foi exportado de uma ferramenta de design (runtime **dc**). As páginas não são HTML
estático comum: o template fica dentro de `<x-dc>` e é montado no navegador por `support.js` com React.

![Desktop](./preview-desktop.jpg)

---

## 1. Mapa de arquivos

| Arquivo | Papel | Status |
|---|---|---|
| `index.html` | Página inteira: header, hero, 2ª dobra (depoimentos + serviços), 3ª (Resultados + Proceso), 4ª (Nosotros, regras, FAQ, agendar), footer, barra mobile e modais | **Produção** |
| `privacidad.html`, `terminos.html` | Páginas legais estáticas (sem React), texto-modelo pendente de revisão | **Produção (rascunho)** |
| `Landing Contratistas (backup - hero 64svh).dc.html` | Cópia idêntica do index, só muda a altura do hero (`64svh` em vez de `72svh`, linha 22) | Backup |
| `Segunda Dobra - Dos Columnas.dc.html` | Canvas de exploração com as variantes da segunda dobra (rodadas t1–t5) | Rascunho/design |
| `snippets/transicao-hero.html` | Faixa de transição mascarada (92px) entre hero e segunda dobra, removida em 28/07/2026 e guardada para reuso | Guardado |
| `support.js` | Runtime dc (gerado de `dc-runtime/src/*.ts`, não editar) | **Produção** |
| `image-slot.js` | Web component `<image-slot>` do editor; não é mais carregado pelo index | Sobra |
| `grain.png` | Tile de ruído 256×256 da textura da casa | **Produção** |
| `uploads/Gemini_Generated_Image_….png` | Colagem do hero (2752×1536, 7,1 MB) | **Produção** |
| `uploads/pasted-1785214114686-0.png` | Mockup mobile com setas desenhadas sobre as colunas (feedback) | Referência |
| `uploads/pasted-1785215085821-0.png` | Pacote de setas desenhadas **com marca d'água Shutterstock** | Referência — não usar |
| `uploads/captura-atual.png` | Captura de uma faixa de transição trapezoidal | Referência |
| `uploads/coluna_ionica.svg`, `uploads/vectorizer-….svg` | Tentativas de coluna vetorizada | Rascunho |
| `.thumbnail` | Prévia WebP 640×398 gerada pelo editor | Metadado |
| `CLAUDE.md` | Regras persistentes de design do projeto | Documentação |

---

## 2. Como rodar e publicar

```bash
python3 -m http.server 8000   # ou qualquer servidor estático
# abrir http://localhost:8000/
```

- **Precisa de servidor HTTP.** Em `file://` o reparse do template (`fetch(location.href)`) falha.
- **Tudo é local, sem CDN:** React/ReactDOM 18.3.1 em `vendor/`, runtime minificado `support.min.js`
  (gerado de `support.js` com esbuild: `esbuild support.js --minify --target=es2019 --outfile=support.min.js`)
  e fontes em `fonts/` (Archivo variável 500–800 + Barlow 400/500/600, subconjunto latin, woff2, 102 KB).
  O único host externo é o do Wistia, e só quando um vídeo é aberto no popup.
- Publicado em GitHub Pages: https://mynewacnsj.github.io/teste/ (branch `gh-pages`; `.nojekyll` obrigatório).

### Desempenho (primeira dobra)

- `<head>` faz **preload** da imagem do hero (`fetchpriority="high"`, mesmo `media`/`srcset` do `<picture>`, então
  não há download duplo) e das fontes Archivo e Barlow 400. `@font-face` inline com `font-display:swap`.
- Scripts com `defer`: o HTML e a imagem começam a baixar antes do JavaScript.
- Imagem do hero em `media/hero/`: AVIF com WebP de reserva. Celular em retrato recebe um recorte vertical
  (`hero-m-650/1300`, ~29–95 KB) com o mesmo enquadramento do `object-position:68%`; telas largas recebem
  `hero-1280/1920/2752` (~35–131 KB). O PNG original de 6,9 MB fica só em `uploads/` como fonte.
- Textura do index em `grain.webp` (41 KB, WebP q85 de `grain.png`, 102 KB); `grain.png` segue para os mockups.
- Para trocar a imagem do hero: gerar as variantes a partir do original (ver `scripts/` no histórico do commit
  de desempenho) mantendo os mesmos nomes.

## 3. Runtime dc (`support.js`)

**Boot:** esconde `<x-dc>` → carrega React UMD → lê o template de `<x-dc>`, a lógica de
`<script type="text/x-dc" data-dc-script>` e as props de `data-props` → troca `<x-dc>` por
`<div id="dc-root">` → renderiza com `createRoot`. Em produção as props valem o `default` de cada uma.

**Estrutura de uma página:**

```html
<script src="./support.js"></script>
<x-dc>
  <helmet data-dc-atomics="">…fontes, scripts, <style> base…</helmet>
  …template…
</x-dc>
<script type="text/x-dc" data-dc-script data-props="{…}">
class Component extends DCLogic { renderVals() { return {…} } }
</script>
```

**Linguagem de template:**

| Sintaxe | Uso |
|---|---|
| `{{ caminho.a[0] }}` | Interpolação; aceita `!`, `==`, `===`, literais. Sem ternário, aritmética, `&&`/`||` ou chamadas — isso vai em `renderVals()` |
| `<sc-if value="{{ flag }}" hint-placeholder-val="{{ true }}">` | Condicional (não existe `sc-else`). O `hint` é só o valor de preview no editor |
| `<sc-for list="{{ items }}" as="it">` | Loop (`$index` disponível) |
| `onClick="{{ fn }}"`, `aria-expanded="{{ x }}"` | Eventos e atributos ligados |
| `style-hover="…"` | Estilo de hover (vira classe gerada com `!important`) |
| `<helmet data-dc-atomics>` | Injeta no `<head>` (scripts/links uma vez, `<style>` vivo) + classes utilitárias |
| `<dc-import>`, `<x-import>` | Componentes externos (não usados neste projeto) |

**Lógica:** classe `Component extends DCLogic`, API estilo React de classe (`this.props`, `this.state`,
`setState`, `componentDidMount/DidUpdate/WillUnmount`). `renderVals()` devolve as variáveis do template.
O script não passa por Babel: tem de ser JS puro, sem JSX.

**Limitação importante:** o runtime **não interpola `{{ }}` dentro de `style="…"`**. Por isso todo
valor dinâmico de estilo (opacidades, alturas, transforms) é aplicado direto no DOM por métodos `_paint()`,
usando atributos-gancho `data-av-*`.

---

## 4. Página principal (`index.html`)

![Mobile](./preview-mobile.jpg)

### 4.1 Hero

Raiz `[data-av-root]`: `min-height:min(100svh, calc(72svh + 34vw))`, `padding-top:clamp(72px,9vh,104px)`.

**Camadas de fundo (de baixo para cima):**
1. `<img>` da colagem com `object-fit:cover; object-position:68% 50%` (27) — o foco fica à direita, o texto à esquerda.
2. Scrim horizontal escuro, em três intensidades (`scrimSoft/Medium/Heavy`, 30–38).
3. Fade vertical para `#0c0c0d` e brilho âmbar radial (40–41).
4. Scrim extra no mobile (`isNarrow`, 43–45).
5. Grão + hachura 135° (47–48) e vinheta (49).

**Header fixo** (51–95): camada de chrome com blur que aparece quando a página rola; logo (quadrado âmbar ◆ +
"Logotipo / Agencia"); nav desktop *Servicios · Resultados · Proceso · Nosotros* + CTA ghost "Agendar llamada";
no mobile, hambúrguer âmbar que vira X e abre um menu com os mesmos links e CTA sólido.

**Conteúdo** (97–142):
- Rail vertical "Est. 2016" (≥1180px).
- **H1:** "Nº 1 en Marketing para / Remodeling/Construction / *en Estados Unidos.*" (destaque âmbar), Archivo 800, `min(6.9vw,6.6vh,84px)`.
- Subtítulo: "Generamos y calificamos prospectos de remodelación de alto ticket, para que tu equipo solo hable con quien ya está listo para firmar."
- CTA único "Agendar diagnóstico gratis →" (âmbar sólido).
- Trust bar: **+180** Contratistas · **$42M** En contratos cerrados · **24 h** Tiempo de respuesta.

**Mobile (< 760px):** o texto não é centralizado verticalmente: alinha ao topo com
`padding-top: clamp(36px,5.5vh,52px)` (~46px entre o logo e a headline) e o hero passa a ter a altura do
conteúdo, deixando o carrossel a ~70px dos números (`margin-top: clamp(36px,4vw,72px)`). A imagem e os véus (`[data-av-heroimg]`, `[data-av-herolayer]`)
mantêm a altura antiga `min(100svh, calc(72svh + 34vw))`, então a foto fica idêntica (mesma escala,
enquadramento e escurecimento); `[data-av-herofade]` (120px, abaixo do grão) fecha o rodapé no `#0c0c0d`.

**Rodapé do hero** (144–157): "Desliza" (scroll cue, ≥760px) e "NÚMERO 1 EN ESTADO UNIDOS" (≥640px).

### 4.2 Carrossel de vídeos (topo da segunda dobra)

Logo abaixo da headline de depoimentos (eyebrow "Clientes reales" + H2 "Estuvieron donde tú estás hoy.
*Escúchalos.*" + linha "Con el celular, desde la obra o la camioneta, cuentan qué cambió en su negocio.
Dale play."), em largura total (`[data-av-reel]`). O parágrafo "Con leads pero sin filtro…" ficou
abaixo do carrossel, abrindo a parte dos pilares. (O título "TESTIMONIOS" antigo está no commit 8084ed3.)

- **6 vídeos** (lista `REEL` no script): `u3z5opwfg5`, `qtq97pqw42`, `85xxi41ehr`, `myhu1aftp6`, `j9kq9ph7rs`,
  `vwcc31ysmm`. **Sem player do Wistia** (era pesado: ~150 requisições, ~1,4s de CPU em JS e 3,5s até a 1ª prévia).
- **Cards = `<video>` nativo.** `_mountReel()` cria um vídeo mudo, em loop e `playsinline` em cada
  `[data-av-reel-slot]` (fora do React). A prévia é um MP4 curto hospedado no site (`media/reel/<id>.mp4`,
  360p, 5–7s, sem áudio, 135–380 KB) e o poster é o 1º quadro (`media/reel/<id>.webp`, 6–21 KB), então a
  troca poster → vídeo não pisca. O `src` só é ligado quando o card chega perto da tela e só os cards
  visíveis tocam (`IntersectionObserver`); com `prefers-reduced-motion` ou economia de dados fica o poster.
  Play âmbar translúcido (72%, 90% no hover) no estilo do Wistia (`.av-reel-play`); camada transparente `.av-reel-hit` abre o popup.
- **Popup = `<video controls>` nativo** com o MP4 servido pelo Wistia (`embed-ssl.wistia.com/deliveries/…mp4`;
  540p em telas < 760px, 720p acima). O vídeo é criado e recebe `play()` dentro do próprio clique, para
  tocar com som também no iOS. Enquanto o popup está aberto as prévias pausam.
- **Regerar as prévias** (se um vídeo mudar no Wistia, as URLs `deliveries/…` também mudam e precisam ser
  atualizadas em `REEL`): baixar o MP4 720p e rodar
  `ffmpeg -ss 0 -to <fim> -i in.mp4 -an -vf "scale=360:-2:flags=lanczos,format=yuv420p" -c:v libx264 -profile:v main -level 3.1 -preset veryslow -crf 27 -r 30 -g 60 -movflags +faststart media/reel/<id>.mp4`
  e `ffmpeg -i media/reel/<id>.mp4 -frames:v 1 -c:v libwebp -quality 72 media/reel/<id>.webp`.
- **Loop infinito sem pausa:** 2 grupos idênticos de 6 cards; cada grupo anima `translateX(0 → -100%)` da
  própria largura (`@keyframes av-reel`), então a emenda é exata em pixel. Velocidade moderada:
  30s por volta no mobile (~36 px/s), 40s no desktop (~40 px/s). Não pausa no hover.
- **Tamanho:** mobile = 2 vídeos por linha (`(100vw - 52px) / 2`, 169px em 390px); desktop =
  `max(clamp(200px,17vw,300px), 100vw/6 - 20px)` (garante 1 grupo ≥ largura da tela). Cards sem sombra.
- **Degradê das bordas:** `mask-image` horizontal no `.av-reel` (curva ease-out em 9 paradas, largura
  `--av-reel-fade: clamp(44px,13vw,260px)`), mobile e desktop. É máscara e não camada pintada: os cards
  se dissolvem no próprio fundo da seção (grão, hachura e brilho âmbar), sem emenda de cor.
- **Acessibilidade:** só o 1º grupo é focável (botões com `aria-label "Reproducir video N de 6"`);
  a cópia tem `aria-hidden` e `tabindex=-1`. Com `prefers-reduced-motion` a faixa para e vira rolagem manual.
- **Popup** (`[data-av-vmodal]`, fora da `<section>`): moldura 9:16 centrada (nunca tela cheia) com rótulo
  "Clientes reales 0N / 06", filete âmbar no topo, brilho âmbar atrás, véu escuro com blur + grão + hachura e botão ×.
  **Animação** (Web Animations API, em `_openVideo`/`_closeVideo`):
  - Abrir: o card clicado cresce da posição dele até a moldura (transição de elemento compartilhado / FLIP,
    780 ms, `cubic-bezier(.16,1,.3,1)`), com o quadro atual da prévia como pôster (troca invisível) e o play âmbar
    se dissolvendo; véu escurece (560 ms); brilho acende (+220 ms); rótulo entra com tracking (+380 ms); filete se
    desenha (+460 ms); × gira e entra (+520 ms). O vídeo surge em fade quando começa a tocar (ou se falhar).
  - Fechar (Esc, véu, ×): controles e filete saem em ~160–220 ms, o vídeo encolhe até o lugar exato do card
    (520 ms, `cubic-bezier(.2,0,0,1)`), o véu clareia e a moldura se dissolve sobre o card. Fechar no meio da
    abertura parte do estado atual de cada peça.
  - **Desempenho:** todas as animações são só `transform`/`opacity` (rodam no compositor da GPU, sem depender da
    thread principal). A sombra da moldura é uma camada à parte (`.av-vmodal-shadow`) com o mesmo transform; o
    "fechar do espaçamento" do rótulo é feito letra a letra com `translateX`; sem `backdrop-filter` (véu `rgba(8,8,9,.93)`).
    O clique faz todas as leituras de layout antes das escritas; render do React, pausa das prévias e congelamento
    do carrossel ficam para depois do 1º quadro. No `pointerdown`/foco do card o popup é pré-aquecido
    (`data-state="prime"`: visível, transparente e sem eventos por até 1,5 s) para as camadas já estarem rasterizadas.
    Medido com CPU 6× mais lenta (celular fraco): quadros perdidos por abertura+fechamento caíram de 39–50 para 1–2.
  - O carrossel fica congelado (`[data-av-reel][data-paused]`) enquanto o popup está aberto; cliques nos primeiros
    500 ms não fecham (duplo clique); `prefers-reduced-motion` → fade de 200 ms. Foco vai ao × e volta ao card.

### 4.3 Serviços (`#servicios`, dentro da segunda dobra)

Bloco logo após o carrossel, na mesma `<section>` escura da segunda dobra (mesmo fundo `#0c0c0d`, lavagens de
luz âmbar, grão e hachura cobrindo a altura toda, mais um brilho âmbar discreto no canto inferior esquerdo).
Versões anteriores com fundo claro e âmbar cortando o carrossel ao meio estão em `backups/`.

Layout modelado na seção "Our services" de marroconstruction.adsconversion.online:
- Eyebrow "Servicios" + H2 "Desde que te encuentran hasta que *firman tu estimate*." + barra âmbar + subheadline.
- Grid 2×2 (≥760px) / 1 coluna (mobile) de cards cinza-escuro `#16171a` (grão screen .13 + hachura .22,
  borda `rgba(244,241,234,.09)`, raio 4px, sem sombra; tag e CTA em âmbar, título creme):
  imagem 3:2 com número em aba escura chanfrada (filete âmbar) e chip; tag âmbar, título, descrição,
  diferencial em caixa alta e CTA "Agendar diagnóstico →".
- Cards: 01 Meta Ads · 02 Social Media · 03 Estimates personalizados · 04 SEO para IA · 05 Sitios web.
  O card 05 (`.av-sv-card--wide`) ocupa a largura total a partir de 760px e fica em linha (imagem 56% à esquerda,
  texto à direita) a partir de 900px; no celular é empilhado como os outros.
  Imagens em `media/servicios/*.webp` (1080×720), todas mockups próprios em HTML (`design/mockups/*.html`, ver o README de lá), renderizados no Chrome:
  anúncio no Instagram com métricas, segmentação e lead (Meta Ads); perfil de Instagram de remodeladora; estimate com marca + conversa de aprovação; assistente de IA recomendando
  a empresa como nº 1 com fontes e mapa. Dados fictícios.
- Textos marcados com `data-av-sv="…"` para facilitar a edição.

### 4.4 Resultados + Proceso (`#resultados`, 3ª dobra — clara)

A «folha» `#f4f1ea` que pousa sobre a mesa escura (corte reto, sem faixa de transição). Textura por classe
(`.av-tex-l`). Dados em `METRICS` e `CASES` no script (fonte única dos números; todos de exemplo).

- **Régua** de 18px na borda superior (3 camadas de ticks; um tick grande cai na margem do container).
- **Abertura:** eyebrow «Resultados», H2 «Los de los videos, *ahora en números.*» (marca-texto âmbar `.av-hl` que se
  desenha no reveal), apoio e ponte com 3 mini-quadros 9:16 (pôsteres do carrossel) que leva ao `#caso-01`.
- **Métricas** (`<dl>`, 2×2 → 4 colunas com container query ≥860px): índice, rótulo, número (sobe de dentro de uma
  máscara), fórmula. Carimbo «Cifras de ejemplo / por confirmar» com `datosDeEjemplo`.
- **3 casos** (`article.av-rs-case#caso-0N`): faixa escura «Caso 0N / 03 · 90 días», miniatura que abre o popup do
  carrossel (`[data-av-case-play]`), nicho/cidade/porte, «Antes» (com etiqueta), «Qué hicimos» (chips com mini-aba),
  linhas pontilhadas «A los 90 días», carimbo e total escuro com o valor âmbar. Layout por container query:
  <600 vertical; 600–959 «ficha deitada» (identificação + números lado a lado, antes + serviços embaixo);
  ≥960 3 colunas com `subgrid` (as 6 faixas alinhadas entre as fichas).
- **Proceso** (`#proceso`): ≥960 prancha horizontal com cotas («Primeras citas: 2 a 3 semanas», «Números estables:
  60 a 90 días»), fita métrica âmbar com as marcas Día 0 / Días 1–14 / Días 15–45 / Mes 2+ e 4 etapas em subgrid
  (Tu parte com chip de tempo / Nuestra parte; citação na 04). Abaixo de 960: linha do tempo vertical feita de
  segmentos de fita por etapa e uma nota.
- **Fecho:** «El plano está listo. Falta tu zona.» + botão escuro «Ver si mi zona está disponible» → `#agendar`.
- **Saída:** picote pontilhado + «mordidas» de 6px (meias-luas `#0c0c0d`) para a 4ª dobra.

### 4.5 Nosotros, Así trabajamos, Preguntas e Agendar (`.av-ed`, 4ª dobra — escura)

Textura de seção por `data-av-grain/hatch` num wrapper com `overflow:hidden` (a `<section>` não tem, por causa do
sticky da FAQ).

- **Nosotros** (`#nosotros`): moldura 4:5 com cantos âmbar; sem foto real mostra o monograma «CS» vazado e
  «Foto del equipo · próximamente» (nunca foto de banco). Prop `fotoEquipo` liga a foto (criada por JS, lazy) e,
  com `datosDeEjemplo=false` e sem foto, a coluna some. Carta, assinatura «El equipo fundador» e ficha
  2016 · LLC · 12 estados.
- **Así trabajamos. Por escrito.** Documento `#16171a` com cabeçalho «Condiciones de servicio», 5 regras
  (número âmbar, dor antiga riscada por um traço âmbar que varre no reveal, seta, compromisso e detalhe) e rodapé
  «Firmado: Contractor Society LLC».
- **Preguntas** (`#preguntas`): lado fixo (sticky ≥900) com link de WhatsApp; 8 `<details>` independentes (o + gira 45°,
  a resposta entra com fade; a altura abre seca).
- **Agendar** (`#agendar`): lavagem âmbar mascarada em px (só aqui), título «Un contratista por zona. *¿La tuya sigue
  libre?*», lista do que o diagnóstico entrega, estrategista (avatar «CS» ou `fotoEstratega`) e o **cartão do
  formulário** claro (borda âmbar, progresso em 2 segmentos).

### 4.6 Formulário, envio e agenda

- **Passos** na mesma célula de grid (`data-step` no `<form>`): 1) código postal (só dígitos) + especialidade em
  tiles; 2) status da zona (neutro por padrão; ocupada se `CFG.zonasOcupadas` tiver o mesmo CP e especialidade),
  nome, WhatsApp/telefone (formata `(xxx) xxx-xxxx` no blur), ticket, consentimento TCPA e honeypot; 3) sucesso.
  Os passos inativos recebem `inert` + `aria-hidden` (`_syncForm`).
- **Validação** no envio de cada passo (mensagem + `aria-invalid` + foco no 1º inválido + leve tremor); depois do
  1º erro revalida ao digitar.
- **Envio** (`_formSubmit`): payload com CP, especialidade, nome, telefone (dígitos), ticket, texto exato do
  consentimento, data, página, referrer e UTMs/gclid/fbclid lidos da URL. Árvore: endpoint+agenda → POST em
  segundo plano e agenda no mesmo clique; só endpoint → espera até 8 s (AbortController), falha mostra «Enviar por
  WhatsApp» / «Intentar de nuevo»; sem endpoint → abre o WhatsApp com a mensagem pronta; só agenda; só e-mail;
  nada → modo de teste. `dataLayer.push({event:'lead_diagnostico'})` se existir (sem nome nem telefone).
- **Agenda** (`[data-av-cal]`): caixa branca com cabeçalho escuro, filete âmbar, iframe criado no clique (mantido
  para reabrir), link alternativo em outra aba, foco preso e devolvido ao gatilho; `calendarMode:'tab'` abre direto
  em outra aba.

### 4.7 Footer e barra mobile

- **Footer** (`.av-ft`): marca + tagline + «Agendar llamada», Navegación, Servicios (âncoras dos cards), Contacto
  (do `CFG`), linha de selos/redes (props `showSeals`/`showTrust`, desligadas), faixa legal com os avisos de
  resultados e de Meta, e o **wordmark** «CONTRACTOR SOCIETY» a 5–7% de opacidade, cortado na borda. O tamanho base
  é `8.7cqw`/`15.6cqw` (sem CLS) e `_fitWordmark` (ResizeObserver no `.av-ft-in`) ajusta a largura exata; no mobile
  são 2 linhas e a 2ª ganha letter-spacing para igualar a 1ª.
- **Barra fixa** (`[data-av-mbar]`, <900px): «Agendar diagnóstico» âmbar + WhatsApp. Visibilidade só por
  IntersectionObserver (depois do hero, some no `#agendar`/footer e com menu, vídeo ou agenda abertos).

### 4.8 Lógica (`data-dc-script`)

**Props editáveis (`data-props`):**

| Prop | Padrão | Efeito |
|---|---|---|
| `scrimIntensity` | `medium` | Intensidade do escurecimento do hero (`soft`/`medium`/`heavy`) |
| `showTrustBar` | `true` | Mostra a faixa de números |
| `showScrollCue` | `true` | Mostra "Desliza" (só ≥760px) |
| `showNavCta` | `true` | Mostra o CTA da nav |
| `datosDeEjemplo` | `true` | Carimbos e notas «Cifras de ejemplo»; com `false` e sem foto, a coluna da foto de Nosotros some |
| `fotoEquipo` / `fotoEstratega` | `''` | Caminho da foto real da equipe (4:5) / avatar do estrategista |
| `showSeals` / `showTrust` | `false` | Selos (Nosotros e footer) e redes no footer, a partir de `CFG.sellos`/`CFG.redes` |

**Constantes no topo do script:** `REEL` (vídeos), `CFG` (contato, envio, agenda, zonas, textos do footer),
`METRICS` e `CASES` (números da 3ª dobra). Antes do 1º render o script põe `html.av-js` (liga a revelação no
scroll; não entra sem IntersectionObserver ou com reduced-motion) e `html.av-prov` com `?prov`.

**Estado:** `w`, `menuOpen`, `stuck`, `video`, `formStep`, `formResult`, `formName`, `zone`, `calFail`, `cal`.

**Breakpoints** (medidos na largura do próprio `[data-av-root]` via `ResizeObserver`, nunca `window.innerWidth`):

| Largura | Muda |
|---|---|
| < 640 | some a nota "Número 1…" |
| < 760 | layout mobile da segunda dobra, scrim extra, sem scroll cue |
| < 900 | hambúrguer no lugar da nav; barra fixa mobile; grids de 12 colunas das dobras novas empilham |
| ≥ 1180 | rail "Est. 2016" |

**Comportamentos:**
- **Header "stuck":** um `IntersectionObserver` observa `[data-av-sentinel]` (60px do topo). Ao rolar, o chrome
  ganha fundo e a barra encolhe de `clamp(72px,9vh,104px)` para `clamp(56px,7vh,74px)`.
- **Menu mobile:** `toggleMenu` alterna `menuOpen`; `_paint` anima `max-height`, opacidade, translateY e as barras do hambúrguer em X. Fecha sozinho ao passar de 900px.
- **Textura adaptativa:** `_paint` ajusta grão/hachura (mobile .075/.13, desktop .115/.2).
- **Robustez:** `_repaint` pinta agora e no próximo frame (um remount de `sc-if` restaura o estilo estático); um poll de 100ms tenta ligar os observers por até 120 tentativas.
- **Revelação no scroll:** `_mountReveal` — um único IntersectionObserver para todo `[data-av-rv]` (vários limiares,
  para blocos mais altos que a tela também revelarem); marca `[data-in]` e para de observar.
- **Cliques delegados** (`_onDocClick`): miniaturas/«Ver su video» dos casos → `_openVideo`; abrir/fechar agenda;
  voltar/tentar de novo no formulário; links para `#agendar` com mouse armam um IO que foca o código postal quando o
  cartão aparece. `submit`, `input`, `change` e `focusout` do formulário também são delegados no `document`.
- **Componentes medem a si mesmos:** container queries nas dobras novas (`.av-rs-kpiwrap` 860, `.av-rs-caseswrap`
  600/960, `.av-pr` 600/960, `.av-ag-card` 520) e ResizeObserver no footer; nunca `window.innerWidth` para layout.

---

## 5. Canvas de variantes (`Segunda Dobra - Dos Columnas.dc.html`)

Documento em modo canvas (`<meta name="design_doc_mode" content="canvas">`) com o histórico de iterações,
da rodada mais nova para a mais antiga. Cada variante é um cartão com âncora (`#3a`) e cada rodada termina com
notas "Probar: …".

| Rodada | Proposta | Variantes |
|---|---|---|
| t1 | Duas colunas sustentando uma **viga âmbar sólida**, CTA contorno | 1a desktop, 1b mobile |
| t2 | Lintel de concreto escuro, pilares encurtados, âmbar só no CTA | 2a desktop, 2b mobile |
| **t3** | **Acabamento — pilares mais presentes, pórtico no mobile** (adotada no index) | **3a** desktop, **3b** mobile |
| t4 | Mobile: pórtico "habitado" — cartões dentro da estrutura | 4a |
| t5 | Mobile: pórtico compacto, objeto fechado, pilares grossos | 5a |

Script próprio mínimo: props `showPillars`, `pillarOpacity`, `showTagline`; `_paint` aplica a opacidade
em cada tipo de pilar (`data-av-portal5`, `portal`, `portico`, `pillar`, `pillarm`) com multiplicadores diferentes.

---

## 6. Faixa de transição (`snippets/transicao-hero.html`)

Entalhe de 92px em que a segunda dobra "sobe" sobre o fim do hero com silhueta de frontão/lintel (desktop) ou
platô (mobile), recortado por **máscara SVG em data URI**. Para recolocar:
1. Colar os dois `<sc-if>` como primeiros filhos da `<section>` da segunda dobra.
2. Voltar o wrapper de luz da seção de `inset:0` para `top:-92px` (continuidade de fase da textura).
3. Reduzir o `padding-top` da seção.

Regras: `margin-top:-92px` (sobrepõe sem somar altura), `overflow:hidden` obrigatório (senão as camadas de
3000px esticam o scroll), maiúsculas do SVG percent-codificadas e nada de `;` no data URI.

---

## 7. Sistema de design

**Paleta**

| Token | Valor |
|---|---|
| Fundo escuro | `#0c0c0d` |
| Fundo claro / texto sobre escuro | `#f4f1ea` |
| Texto escuro | `#16171a` |
| Âmbar | `#e9a227` (hover `#f6bc4d`) |
| Âmbar sobre claro | `#c98a12` só em grafismo; texto âmbar pequeno sobre claro `#8f5d07` (`--av-amber-ink`) |
| Tintas sobre claro | corpo `rgba(22,23,26,.72)`, notas `.62` (mínimo) · erro `#b3261e` |
| Cartões | `#ffffff`, borda `rgba(22,23,26,.09)`, raio 4px |
| Botões | raio 2px |

**Tipografia:** Archivo 500–800 (títulos, rótulos, números; eyebrows em caixa alta com tracking largo
`.28em`–`.36em`) e Barlow 400–600 (corpo). Tamanhos fluidos com `clamp()`/`min()` combinando `vw` e `vh`.

**Layout:** container `width:max(80%, min(100% - 2 * clamp(20px, 5vw, 88px), 1100px)); margin:0 auto`.
Medida de leitura: headline até 1060px, parágrafos 660–720px.

**Textura da casa** (todo fundo sólido): duas camadas absolutas filhas do elemento com a cor, nesta ordem:
1. Grão `url(./grain.webp)` 256px em repeat.
2. Hachura `repeating-linear-gradient(135deg, <linha> 0 1px, transparent 1px 4px)`.

| Fundo | Grão | Hachura |
|---|---|---|
| Escuro | `opacity:.13`, `mix-blend-mode:screen` | `rgba(255,255,255,.055)` a `opacity:.22` |
| Claro | `opacity:.085`, `multiply` | `rgba(22,23,26,.021)` |
| Âmbar | `opacity:.12`, `multiply` | `rgba(12,12,13,.045)` |

Seções escuras usam `data-av-grain`/`data-av-hatch` (o `_paint` ajusta); superfícies claras, âmbar e cards usam as
classes `.av-tex-l`, `.av-tex-a`, `.av-tex-d` (span `aria-hidden` como 1º filho de uma superfície com `isolation`).

**Motion:** só `transform` e `opacity` (CSS ou Web Animations), `transform-origin` no CSS estático, nada de
`backdrop-filter`, nenhum scroll listener. Curvas `--av-ease: cubic-bezier(.16,1,.3,1)` e `--av-exit: cubic-bezier(.4,0,1,1)`.

**Material "concreto" dos pilares:** gradiente cinza quente com realce âmbar no lado iluminado, poros com três
`radial-gradient` em tamanhos primos, juntas horizontais por `repeating-linear-gradient`, furos de forma,
grão em `multiply` e contorno levemente irregular com `clip-path: polygon(…)`.

**Linguagem visual:** escuro, quente e "de obra" — preto granulado, luz âmbar de fim de tarde, fotos de canteiro,
arquitetura (pórtico, lintel, colunas) como metáfora do método.

---

## 8. Pontos de atenção

**Trocar antes de anunciar** (tudo marcado com `data-av-tbd`; abra a página com `?prov` para ver contornado):

1. **Métricas da 3ª dobra** (`METRICS`): $142 por cita, 61% a estimate, ticket $23,800, retorno $1 → $9, e a base
   «Promedio de clientes activos · ene–sep 2026». Calibradas entre si e com os casos: ao trocar uma, revise as outras.
2. **Casos** (`CASES`): confirmar que `qtq97pqw42`, `85xxi41ehr` e `j9kq9ph7rs` autorizam o uso de números por escrito
   e trocar nicho, cidade, porte, «Antes», serviços, inversión, citas, contratos, valor, razão por $1, período e
   etiquetas. Sem dado real, troque o cliente. Nunca usar `u3z5opwfg5`.
3. **`datosDeEjemplo`** → `false` só quando tudo for real e autorizado (não rodar tráfego pago com `true`).
4. **Fee** «desde $1,500» (FAQ 01), termos (90 dias + mês a mês + 30 dias de aviso), «20 min al mes», prazos do
   Proceso e «menos de 24 h».
5. **Nosotros:** carta, assinatura (nome do fundador), ano 2016, LLC no Texas, 12 estados; `fotoEquipo` real
   (AVIF/WebP ≤120 KB, 4:5) e `CFG.ciudadEquipo`.
6. **Contatos e envio (`CFG`):** `whatsapp`, `phoneDisplay`/`phoneHref`, `email` (hoje 555-01xx/example.com),
   `formEndpoint` (Formspree ou próprio com CORS), `calendarUrl`/`calendarMode`, `zonasOcupadas`/`zonasAlDia`.
   Sem `formEndpoint`, o lead depende de o contratista apertar «enviar» no WhatsApp.
7. **Texto TCPA** do consentimento e as páginas `privacidad.html`/`terminos.html`: revisão jurídica.
8. **Selos e redes:** `CFG.sellos`/`CFG.redes` + props `showSeals`/`showTrust`, só com itens reais.

**Outros:**
- **Erro de copy:** "NÚMERO 1 EN ESTADO UNIDOS" no rodapé do hero → deveria ser "ESTADOS UNIDOS".
- **Referência com marca d'água Shutterstock** em `uploads/` — não usar em produção.
- Resolvidos: imagem do hero otimizada (AVIF/WebP + preload), React e fontes locais, links e CTAs ligados às âncoras,
  logo em texto.
