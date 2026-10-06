#!/usr/bin/env bash
# Salva uma cópia do código atual em backups/<data>_<descrição>/ antes de cada alteração.
# Uso: scripts/backup.sh "descricao curta"
# Restaurar: cp backups/<pasta>/index.html index.html  (idem para os demais arquivos)
set -euo pipefail
cd "$(dirname "$0")/.."
desc="${1:-alteracao}"
slug=$(printf '%s' "$desc" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-_')
dest="backups/$(date -u +%Y-%m-%d_%H%M)_${slug}"
mkdir -p "$dest/docs"
cp index.html CLAUDE.md README.md "$dest/"
cp docs/ARQUITETURA.md "$dest/docs/"
echo "$dest"
