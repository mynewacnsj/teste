# Projeto — Landing de agência de marketing para contratistas (EUA)

## Regra de textura (persistente)

**Todo background sólido deste projeto recebe a textura da casa.** Duas camadas, sempre
nesta ordem, como filhas absolutas do elemento que carrega a cor:

1. **Grão** — `url(./grain.png)`, `background-size:256px 256px`, `background-repeat:repeat`
2. **Hachura 135°** — `repeating-linear-gradient(135deg, <linha> 0px, <linha> 1px, transparent 1px, transparent 4px)`

Ajuste por luminosidade do fundo:

| Fundo | Grão | Hachura |
|---|---|---|
| Escuro (`#0c0c0d`) | `opacity:.13` + `mix-blend-mode:screen` | linha `rgba(255,255,255,.055)` a `opacity:.22` |
| Claro (`#f4f1ea`) | `opacity:.085` + `mix-blend-mode:multiply` | linha `rgba(22,23,26,.021)`, sem opacity extra |

Já aplicada em: hero, menu mobile (camada de chrome do header), faixa de transição
(desktop e mobile) e segunda dobra.

**Continuidade de fase:** quando dois elementos vizinhos precisam que a textura atravesse
a costura, ancore a origem de repetição no mesmo ponto. A faixa de transição tem 92px e a
camada de textura da seção usa `top:-92px`, então compartilham o mesmo espaço de repetição.

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

## Idioma

Copy em **espanhol** (público: contratistas de remodelação nos EUA).
