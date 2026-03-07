#!/bin/bash
# Script de desenvolvimento — necessário porque o Next.js fork falha com colchetes no path
# Sincroniza arquivos para /tmp/architrack-dev e roda o servidor de lá

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
DEV_DIR="/tmp/architrack-dev"

echo "Sincronizando arquivos..."
rsync -a --exclude='node_modules' --exclude='.next' --exclude='.git' "$SRC_DIR/" "$DEV_DIR/"

if [ ! -d "$DEV_DIR/node_modules" ]; then
  echo "Instalando dependências..."
  cd "$DEV_DIR" && npm install
fi

echo "Iniciando servidor em $DEV_DIR..."
echo "Acesse: http://localhost:3000"
cd "$DEV_DIR" && npx next dev
