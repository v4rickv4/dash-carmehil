#!/bin/bash
echo "Configurando o ambiente..."
echo "DATABASE_URL=postgresql://v4faresoliveira:Wpmf#(FrLrIHXCKYesbniIE)@open-claw-banco-v4:5432/banco-v4" > .env.local
pnpm approve-builds
pnpm install
echo "Iniciando o dashboard..."
pnpm run dev
