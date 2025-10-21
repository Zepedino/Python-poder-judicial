#!/bin/bash
# Este script evita que Playwright descargue navegadores

echo "🚀 Instalando dependencias sin navegadores..."
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
pip install -r requirements.txt
echo "✅ Instalación completada"
