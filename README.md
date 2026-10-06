# Landing — Agência de marketing para contratistas (EUA)

Landing page em espanhol para uma agência que gera e qualifica leads de remodelação/construção de alto ticket
nos Estados Unidos. Visual escuro e quente (preto granulado + âmbar), com a metáfora das **duas colunas**:
Demanda e Filtro.

![Prévia desktop](docs/preview-desktop.jpg)

## Rodar

```bash
python3 -m http.server 8000
# http://localhost:8000/
```

Precisa de servidor HTTP e de internet (React vem do unpkg e as fontes do Google Fonts).

## Estrutura

- `index.html` — página principal (hero + segunda dobra "El Método")
- `support.js` — runtime que monta as páginas `<x-dc>` com React
- `grain.png` — textura de grão da casa
- `uploads/` — imagem do hero e referências de design
- `Segunda Dobra - Dos Columnas.dc.html` — canvas com as variantes da segunda dobra
- `snippets/transicao-hero.html` — faixa de transição guardada para reuso
- `CLAUDE.md` — regras de design (textura, paleta, tipografia, layout)

Documentação completa de lógica, design e pontos de atenção: **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)**.
