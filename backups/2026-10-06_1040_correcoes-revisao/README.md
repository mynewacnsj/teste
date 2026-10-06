# Landing — Contractor Society (marketing para contratistas en EE. UU.)

Landing page em espanhol para uma agência que gera e qualifica leads de remodelação de alto ticket para
contratistas hispanos nos Estados Unidos. Visual escuro e quente (preto granulado + âmbar), com uma dobra clara
de resultados no meio.

**Online:** https://mynewacnsj.github.io/teste/

![Prévia desktop](docs/preview-desktop.jpg)

## Rodar

```bash
python3 -m http.server 8000
# http://localhost:8000/   (abra com ?prov para contornar os dados provisórios)
```

Precisa de servidor HTTP. Tudo é local (React em `vendor/`, fontes em `fonts/`); o único host externo é o do
Wistia, e só quando um vídeo é aberto.

## Página (de cima para baixo)

1. **Hero** — headline, CTA e números.
2. **Clientes reales** — carrossel de 6 depoimentos em vídeo + **Servicios** (5 cards).
3. **Resultados** (clara) — métricas, 3 casos e **Proceso** em 4 etapas.
4. **Nosotros**, **Así trabajamos** (5 regras), **Preguntas** e **Agendar** (formulário em 2 passos + agenda).
5. **Footer** e barra fixa de agendamento no celular.

## Antes de anunciar

Os números dos casos e das métricas, contatos, envio do formulário, agenda, carta/assinatura de Nosotros e os
textos legais são de **exemplo**. Tudo fica no objeto `CFG`, nas listas `METRICS`/`CASES` (script do `index.html`)
e marcado com `data-av-tbd`. Lista completa em [docs/ARQUITETURA.md](docs/ARQUITETURA.md#8-pontos-de-atenção).

## Estrutura

- `index.html` — página inteira (template `<x-dc>` + lógica em `data-dc-script`)
- `privacidad.html`, `terminos.html` — páginas legais estáticas (rascunho)
- `support.js` / `support.min.js` — runtime que monta o `<x-dc>` com React
- `media/` — hero, prévias do carrossel e imagens dos serviços · `fonts/` · `vendor/` · `grain.webp`
- `design/mockups/` — fontes HTML das imagens dos serviços
- `CLAUDE.md` — regras de design e de implementação
- `backups/` — cópia do código antes de cada alteração (`scripts/backup.sh "descrição"`)

Documentação completa de lógica, design e pontos de atenção: **[docs/ARQUITETURA.md](docs/ARQUITETURA.md)**.
