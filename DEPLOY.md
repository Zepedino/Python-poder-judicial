# 🚀 Guía de Despliegue en Vercel

## ✅ Pasos Completados

1. **Configuración de Vercel** (`vercel.json`)
   - ✓ Build automático con `@vercel/python`
   - ✓ Rutas configuradas correctamente
   - ✓ Timeout de 60 segundos
   - ✓ Memoria de 3008 MB

2. **Dependencias** (`requirements.txt`)
   - ✓ Flask, Playwright, Gemini AI
   - ✓ BeautifulSoup4, python-dotenv
   - ✓ WebSockets para Browserless

3. **Estructura**
   - ✓ `api/index.py` - punto de entrada
   - ✓ `modules/` - scraper y traductor
   - ✓ `static/` y `templates/` - frontend

## 🔑 Variables de Entorno Requeridas

**IMPORTANTE:** Configura estas variables en Vercel **ANTES** de desplegar:

### 1. BROWSERLESS_TOKEN
```
Obtén tu token en: https://www.browserless.io/
Plan gratuito: 6 horas/mes
```

### 2. GEMINI_API_KEY
```
Obtén tu API key en: https://aistudio.google.com/app/apikey
Es gratis con límites generosos
```

## 📦 Cómo Desplegar

### Opción 1: Desde el CLI de Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Desplegar
vercel

# Configurar las variables de entorno
vercel env add BROWSERLESS_TOKEN
vercel env add GEMINI_API_KEY

# Re-desplegar con las variables
vercel --prod
```

### Opción 2: Desde el Dashboard de Vercel

1. **Conecta el repositorio:**
   - Ve a https://vercel.com/new
   - Conecta tu repo de GitHub
   - Selecciona la rama `fix/vercel-deploy`

2. **Configura las variables de entorno:**
   - Settings > Environment Variables
   - Agrega `BROWSERLESS_TOKEN`
   - Agrega `GEMINI_API_KEY`
   - Marca como disponibles en Production, Preview y Development

3. **Despliega:**
   - El deploy se ejecutará automáticamente
   - Vercel detectará `vercel.json` y usará las configuraciones

## 🧪 Probar el Despliegue

Después de desplegar, prueba estos endpoints:

```bash
# Health check
curl https://tu-proyecto.vercel.app/health

# Test Browserless
curl https://tu-proyecto.vercel.app/test-browserless

# Búsqueda de prueba
curl -X POST https://tu-proyecto.vercel.app/api/buscar-nombre \
  -H "Content-Type: application/json" \
  -d '{
    "tipoPersona": "natural",
    "nombres": "Juan",
    "apellidoPaterno": "Pérez",
    "apellidoMaterno": "García",
    "año": "2023",
    "competencia": "Corte Suprema"
  }'
```

## 🐛 Debugging

Si algo falla:

1. **Ver logs en tiempo real:**
   ```bash
   vercel logs
   ```

2. **Verificar variables de entorno:**
   - Visita: `https://tu-proyecto.vercel.app/health`
   - Debe mostrar `browserless_token_set: true`
   - Debe mostrar `gemini_api_key_set: true`

3. **Probar Browserless:**
   - Visita: `https://tu-proyecto.vercel.app/test-browserless`
   - Debe retornar `success: true`

## ⚠️ Límites de Vercel

- **Timeout máximo:** 60 segundos (Hobby) / 300 segundos (Pro)
- **Memoria:** 3008 MB máximo
- **Size limit:** 250 MB (por eso usamos Browserless, no navegador local)
- **Playwright:** Solo funciona con conexión remota (Browserless)

## 💡 Notas Importantes

1. **NO se instalan navegadores de Playwright** - se usa Browserless remoto
2. **El frontend está en `/templates/index.html`** - Flask lo sirve
3. **Los archivos estáticos están en `/static/`** - JS, CSS, imágenes
4. **Logs detallados** - cada paso del scraping se registra para debugging

## 🔄 Actualizar el Código

```bash
# Hacer cambios
git add .
git commit -m "Descripción del cambio"
git push origin fix/vercel-deploy

# Vercel desplegará automáticamente
```

## ✅ Checklist Final

- [ ] `BROWSERLESS_TOKEN` configurado en Vercel
- [ ] `GEMINI_API_KEY` configurado en Vercel
- [ ] `/health` retorna status OK
- [ ] `/test-browserless` retorna success
- [ ] Búsqueda de prueba funciona
- [ ] Frontend se carga correctamente
- [ ] Logs muestran conexión exitosa a Browserless
