# Backups do código

Cada pasta é uma cópia do código **antes** de uma alteração, nomeada `AAAA-MM-DD_HHMM_<descrição>` (horário UTC).

Conteúdo de cada pasta: `index.html`, `CLAUDE.md`, `README.md` e `docs/ARQUITETURA.md`.
Imagens e vídeos (`media/`, `uploads/`) não entram, porque não são editados — só adicionados.

**Criar um backup:** `scripts/backup.sh "descricao curta"`

**Voltar a uma versão:** copie o arquivo da pasta desejada por cima do atual, por exemplo:

```bash
cp backups/2026-10-06_0426_antes-terceira-dobra/index.html index.html
```

O histórico completo também está no git (`git log`), com uma versão por alteração publicada.
