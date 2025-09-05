#!/bin/bash

ORG_OR_USER="$1"
REPO="$2"

if [ -z "$ORG_OR_USER" ] || [ -z "$REPO" ]; then
  echo "Uso: $0 <org_o_usuario> <repo_name>"
  exit 1
fi

set -e

# Try gh CLI first
if command -v gh &>/dev/null; then
  echo "Usando gh CLI..."
  gh repo create "$ORG_OR_USER/$REPO" --public --confirm || {
    echo "gh repo create falló, intentando con REST API..."
  }
else
  echo "gh CLI no disponible, intentando REST API..."
fi

if [ ! -d ".git" ]; then
  git init
fi
git add .
git commit -m "Initial tradition-agro commit"
git branch -M main

REMOTE_URL="https://github.com/$ORG_OR_USER/$REPO.git"
git remote add origin "$REMOTE_URL" 2>/dev/null || git remote set-url origin "$REMOTE_URL"
git push -u origin main

echo "¡Repositorio publicado en: $REMOTE_URL!"