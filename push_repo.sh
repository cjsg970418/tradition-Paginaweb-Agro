#!/bin/bash

ORG_OR_USER="$1"
REPO="$2"

if [ -z "$ORG_OR_USER" ] || [ -z "$REPO" ]; then
  echo "Uso: $0 <org_o_usuario> <repo_name>"
  exit 1
fi

set -e

git add .
git commit -m "Push incremental tradition-agro" || echo "Nada nuevo para commitear"
git push origin main

echo "Push realizado a https://github.com/$ORG_OR_USER/$REPO"