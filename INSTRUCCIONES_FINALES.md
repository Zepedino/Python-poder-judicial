# 🎯 INSTRUCCIONES FINALES - Despliegue en Vercel

## ✅ Cambios Realizados (Ya están en GitHub)

### 1. **vercel.json** - Configuración Completa
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [...],
  "functions": {
    "api/index.py": {
      "maxDuration": 60,
      "memory": 3008
    }
  }
}
```
- ✓ Build automático con @vercel/python
- ✓ Timeout de 60 segundos
- ✓ Memoria máxima (3008 MB)

### 2. **requirements.txt** - Dependencias
- ✓ Flask, Playwright, Gemini AI
- ✓ BeautifulSoup4, WebSockets
- ✓ Variable PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

### 3. **Archivos Optimizados**
- ✓ .gitignore mejorado
- ✓ .vercelignore optimizado
- ✓ Eliminado build.sh (no es necesario)

---

## 🚀 PASOS PARA DESPLEGAR

### **PASO 1: Obtener Tokens (OBLIGATORIO)**

#### A) BROWSERLESS_TOKEN
1. Ve a: https://www.browserless.io/
2. Crea cuenta gratuita (6 horas/mes)
3. Copia el token desde el dashboard

#### B) GEMINI_API_KEY
1. Ve a: https://aistudio.google.com/app/apikey
2. Crea una nueva API Key
3. Cópiala (es gratis)

---

### **PASO 2: Desplegar en Vercel**

#### **Opción A: Dashboard de Vercel (MÁS FÁCIL)**

1. **Conecta el repo:**
   - Ve a: https://vercel.com/new
   - Conecta tu GitHub
   - Selecciona: `Python-poder-judicial`
   - **IMPORTANTE:** Elige la rama `fix/vercel-deploy`

2. **Configura variables de entorno:**
   - En la misma pantalla de import, ve a "Environment Variables"
   - Agrega:
     ```
     BROWSERLESS_TOKEN = [tu token aquí]
     GEMINI_API_KEY = [tu api key aquí]
     ```
   - Marca: ☑️ Production ☑️ Preview ☑️ Development

3. **Despliega:**
   - Click en "Deploy"
   - Espera 2-3 minutos

#### **Opción B: Vercel CLI**

```bash
# 1. Instalar CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Desplegar
cd /ruta/a/tu/proyecto
vercel

# 4. Agregar variables de entorno
vercel env add BROWSERLESS_TOKEN
# Pega tu token y presiona Enter
# Selecciona: Production, Preview, Development

vercel env add GEMINI_API_KEY
# Pega tu API key y presiona Enter
# Selecciona: Production, Preview, Development

# 5. Re-desplegar con las variables
vercel --prod
```

---

## 🧪 PASO 3: Probar el Despliegue

Una vez desplegado, prueba estos endpoints:

### 1. Health Check
```bash
curl https://tu-proyecto.vercel.app/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "config": {
    "browserless_token_set": true,
    "gemini_api_key_set": true,
    "playwright_available": true
  }
}
```

### 2. Test Browserless
```bash
curl https://tu-proyecto.vercel.app/test-browserless
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Conexión exitosa con Browserless",
  "test_page_title": "Google"
}
```

### 3. Búsqueda de Prueba
```bash
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

---

## 🐛 Si Algo Sale Mal

### Error: "BROWSERLESS_TOKEN no configurado"
- **Solución:** Ve a Vercel Settings > Environment Variables
- Verifica que `BROWSERLESS_TOKEN` esté configurada
- Re-despliega: Deployments > ... > Redeploy

### Error: "Timeout" o "Function Execution Failed"
- **Causa:** La búsqueda toma más de 60 segundos
- **Solución:** Upgrade a Vercel Pro (300 segundos de timeout)
- O: Optimiza la búsqueda (menos causas a procesar)

### Error: "No se encontró información"
- **Causa normal:** No hay resultados para esos criterios
- **Prueba con:** Datos reales de causas existentes

### Frontend no se ve
- **URL correcta:** `https://tu-proyecto.vercel.app/`
- **No:** `https://tu-proyecto.vercel.app/api/index.py`
- Si sigue sin funcionar: Verifica que `templates/index.html` exista

---

## 📊 Ver Logs en Tiempo Real

```bash
# Opción 1: CLI
vercel logs --follow

# Opción 2: Dashboard
https://vercel.com/[tu-usuario]/[tu-proyecto]/logs
```

Los logs mostrarán:
```
[SCRAPER] Iniciando conexión a Browserless...
[SCRAPER] ✓ Conectado a Browserless
[SCRAPER] ✓ Página cargada
[SCRAPER] ✓ Clic en "Consulta causas"
...
```

---

## ✅ Checklist de Verificación

- [ ] Tokens obtenidos:
  - [ ] BROWSERLESS_TOKEN
  - [ ] GEMINI_API_KEY

- [ ] Variables configuradas en Vercel:
  - [ ] Production
  - [ ] Preview
  - [ ] Development

- [ ] Tests pasando:
  - [ ] `/health` retorna OK
  - [ ] `/test-browserless` retorna success
  - [ ] Búsqueda funciona

- [ ] Frontend:
  - [ ] Página principal se carga
  - [ ] Formulario visible
  - [ ] Búsqueda desde UI funciona

---

## 💡 Notas Importantes

1. **Plan Gratuito de Browserless:** 6 horas/mes
   - Suficiente para ~360 búsquedas (1 minuto cada una)
   - Monitorea tu uso en: https://www.browserless.io/account

2. **Gemini API:** Gratis con límites generosos
   - 60 requests por minuto
   - 1,500 requests por día

3. **Vercel Hobby (Gratis):**
   - 100 GB bandwidth/mes
   - Suficiente para desarrollo y pruebas
   - Timeout: 60 segundos máximo

4. **Arquitectura:**
   ```
   Usuario → Vercel (Flask)
              ↓
              api/index.py
              ↓
              modules/scraper.py
              ↓
              Browserless.io (Chrome remoto)
              ↓
              pjud.cl (scraping)
              ↓
              modules/ai_translator.py
              ↓
              Gemini AI (traducción)
              ↓
              Respuesta JSON
   ```

---

## 🎉 ¡Listo!

Una vez que completes el PASO 2, tu aplicación estará desplegada y funcionando.

**Tu URL será:** `https://[nombre-proyecto].vercel.app`

**Preguntas frecuentes:**
- ¿Cuánto cuesta? → Todo gratis (con límites)
- ¿Cuánto tarda? → 2-3 minutos el primer deploy
- ¿Puedo usar mi propio dominio? → Sí, en Vercel Settings

**¿Necesitas ayuda?**
- Logs de Vercel: https://vercel.com/docs/observability/logs
- Browserless docs: https://docs.browserless.io/
- Gemini docs: https://ai.google.dev/docs

---

**Última actualización:** $(date)
**Commits pushed:** ✅
**Rama:** fix/vercel-deploy
**Estado:** Listo para desplegar
