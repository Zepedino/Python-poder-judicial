from flask import Flask, render_template, request, jsonify
import os
import sys
import datetime
import traceback

# Configurar paths
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

print(f"[STARTUP] Current dir: {current_dir}")
print(f"[STARTUP] Parent dir: {parent_dir}")
print(f"[STARTUP] Python path: {sys.path}")

# Importar módulos
try:
    from modules.scraper import perform_scraping
    from modules.ai_translator import translate_text
    print("[STARTUP] ✅ Módulos importados correctamente")
except ImportError as e:
    print(f"[STARTUP] ❌ Error importando módulos: {e}")
    traceback.print_exc()
    raise

# Configurar Flask
app = Flask(
    __name__,
    template_folder=os.path.join(parent_dir, 'templates'),
    static_folder=os.path.join(parent_dir, 'static'),
    static_url_path='/static'
)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

@app.route('/')
def index():
    """Página principal"""
    try:
        return render_template('index.html')
    except Exception as e:
        print(f"[ERROR] Error cargando template: {e}")
        traceback.print_exc()
        return f"Error: {e}", 500

@app.route('/health')
def health():
    """Endpoint de salud mejorado"""
    try:
        browserless_token = os.getenv('BROWSERLESS_TOKEN')
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        
        # Intentar importar playwright
        playwright_available = False
        try:
            from playwright.sync_api import sync_playwright
            playwright_available = True
        except Exception as e:
            print(f"[HEALTH] Playwright error: {e}")
        
        return jsonify({
            'status': 'ok',
            'timestamp': datetime.datetime.now().isoformat(),
            'environment': os.getenv('VERCEL_ENV', 'local'),
            'python_version': sys.version,
            'config': {
                'browserless_token_set': bool(browserless_token),
                'browserless_token_length': len(browserless_token) if browserless_token else 0,
                'gemini_api_key_set': bool(gemini_api_key),
                'playwright_available': playwright_available,
                'template_folder': app.template_folder,
                'static_folder': app.static_folder
            }
        })
    except Exception as e:
        print(f"[HEALTH] Error: {e}")
        traceback.print_exc()
        return jsonify({'status': 'error', 'error': str(e)}), 500

@app.route('/test-browserless')
def test_browserless():
    """Endpoint para probar conexión con Browserless"""
    try:
        from playwright.sync_api import sync_playwright
        
        browserless_token = os.getenv('BROWSERLESS_TOKEN')
        if not browserless_token:
            return jsonify({
                'success': False,
                'error': 'BROWSERLESS_TOKEN no configurado'
            }), 500
        
        ws_endpoint = f"wss://chrome.browserless.io?token={browserless_token}"
        
        with sync_playwright() as p:
            browser = p.chromium.connect_over_cdp(ws_endpoint)
            page = browser.new_page()
            page.goto("https://www.google.com", timeout=10000)
            title = page.title()
            browser.close()
            
            return jsonify({
                'success': True,
                'message': 'Conexión exitosa con Browserless',
                'test_page_title': title
            })
            
    except Exception as e:
        print(f"[TEST-BROWSERLESS] Error: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/scraping', methods=['POST'])
def scraping_only():
    """Endpoint para realizar SOLO el web scraping (Paso 1 de 2)"""
    print("\n" + "="*50)
    print("[API/SCRAPING] Nueva solicitud de scraping")
    print("="*50)
    
    try:
        # 1. Verificar variable de entorno
        browserless_token = os.getenv('BROWSERLESS_TOKEN')
        
        print(f"[API/SCRAPING] Browserless token presente: {bool(browserless_token)}")
        
        if not browserless_token:
            error_msg = "BROWSERLESS_TOKEN no está configurado en las variables de entorno de Vercel"
            print(f"[API/SCRAPING] ❌ {error_msg}")
            return jsonify({
                'error': 'Error de configuración del servidor',
                'details': error_msg,
                'help': 'Configura BROWSERLESS_TOKEN en Vercel Settings > Environment Variables'
            }), 500
        
        # 2. Obtener y validar datos del request
        request_data = request.get_json()
        print(f"[API/SCRAPING] Datos recibidos: {request_data}")
        
        if not request_data:
            return jsonify({'error': 'No se recibieron datos'}), 400
        
        # 3. Extraer y validar parámetros
        tipo_persona = request_data.get('tipoPersona')
        nombres = request_data.get('nombres', '')
        apellido_paterno = request_data.get('apellidoPaterno', '')
        apellido_materno = request_data.get('apellidoMaterno', '')
        nombre_persona_juridica = request_data.get('nombrePersonaJuridica', '')
        año = request_data.get('año')
        competencia = request_data.get('competencia')
        tribunal = request_data.get('tribunal', '')
        corte = request_data.get('corte', '')

        # Validaciones
        if not tipo_persona or tipo_persona not in ['natural', 'juridica']:
            return jsonify({'error': 'Debe especificar tipo de persona: natural o jurídica'}), 400
        
        if tipo_persona == 'natural':
            if not nombres and not apellido_paterno and not apellido_materno:
                return jsonify({'error': 'Para persona natural debe ingresar al menos un campo'}), 400
        elif tipo_persona == 'juridica':
            if not nombre_persona_juridica:
                return jsonify({'error': 'Para persona jurídica debe ingresar el nombre'}), 400
        
        if not año or not competencia:
            return jsonify({'error': 'Año y competencia son obligatorios'}), 400
        
        if competencia != 'Corte Suprema':
            if not tribunal or not corte:
                return jsonify({'error': f'Para {competencia} se requiere tribunal y corte'}), 400

        print(f"[API/SCRAPING] ✅ Validación completada")
        
        # 4. Realizar scraping
        print("[API/SCRAPING] 🔄 Iniciando scraping...")
        try:
            raw_data = perform_scraping(request_data)
        except Exception as scraping_error:
            print(f"[API/SCRAPING] ❌ Error en scraping: {scraping_error}")
            traceback.print_exc()
            return jsonify({
                'error': 'Error al realizar la búsqueda',
                'details': str(scraping_error),
                'type': 'scraping_error'
            }), 500
        
        if not raw_data:
            print("[API/SCRAPING] ⚠️ No se encontraron resultados")
            return jsonify({'error': 'No se encontró información para los criterios especificados'}), 404
        
        print(f"[API/SCRAPING] ✅ Scraping exitoso: {len(raw_data)} caracteres")
        
        # 5. Preparar respuesta CON rawData pero SIN translation
        search_info = (
            f"{apellido_paterno} {apellido_materno} {nombres}".strip() 
            if tipo_persona == 'natural' 
            else nombre_persona_juridica
        )

        response_data = {
            "success": True,
            "tipoPersona": tipo_persona,
            "searchInfo": search_info,
            "competencia": competencia,
            "tribunal": tribunal or 'Corte Suprema',
            "corte": corte or 'Corte Suprema',
            "año": año,
            "rawData": raw_data,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        print("[API/SCRAPING] ✅ Scraping completado exitosamente")
        return jsonify(response_data)

    except Exception as e:
        error_msg = str(e)
        error_type = type(e).__name__
        print(f'[API/SCRAPING] ❌ Error inesperado ({error_type}): {error_msg}')
        traceback.print_exc()
        
        return jsonify({
            'error': 'Error interno del servidor',
            'details': error_msg,
            'type': error_type,
            'help': 'Revisa los logs de Vercel para más detalles'
        }), 500


@app.route('/api/translate', methods=['POST'])
def traducir_only():
    """Endpoint para realizar SOLO la traducción con Gemini (Paso 2 de 2)"""
    print("\n" + "="*50)
    print("[API/TRADUCIR] Nueva solicitud de traducción")
    print("="*50)
    
    try:
        # 1. Verificar API key de Gemini
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        print(f"[API/TRADUCIR] Gemini API key presente: {bool(gemini_api_key)}")
        
        # 2. Obtener datos del request
        request_data = request.get_json()
        
        if not request_data:
            return jsonify({'error': 'No se recibieron datos'}), 400
        
        raw_data = request_data.get('rawData')
        
        if not raw_data:
            return jsonify({'error': 'rawData es obligatorio para traducir'}), 400
        
        print(f"[API/TRADUCIR] Texto a traducir: {len(raw_data)} caracteres")
        
        # 3. Traducir con Gemini
        print("[API/TRADUCIR] 🔄 Traduciendo...")
        try:
            translation = translate_text(raw_data, gemini_api_key)
            print(f"[API/TRADUCIR] ✅ Traducción completada: {len(translation)} caracteres")
        except Exception as translation_error:
            print(f"[API/TRADUCIR] ⚠️ Error en traducción (usando básica): {translation_error}")
            translation = translate_text(raw_data, None)

        response_data = {
            "success": True,
            "translation": translation,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        print("[API/TRADUCIR] ✅ Traducción completada exitosamente")
        return jsonify(response_data)

    except Exception as e:
        error_msg = str(e)
        error_type = type(e).__name__
        print(f'[API/TRADUCIR] ❌ Error inesperado ({error_type}): {error_msg}')
        traceback.print_exc()
        
        return jsonify({
            'error': 'Error interno del servidor',
            'details': error_msg,
            'type': error_type
        }), 500


@app.route('/api/buscar-nombre', methods=['POST'])
def buscar_nombre():
    """Endpoint para búsqueda por nombre (COMPLETO - mantener para compatibilidad)"""
    print("\n" + "="*50)
    print("[API] Nueva solicitud de búsqueda")
    print("="*50)
    
    try:
        # 1. Verificar variables de entorno PRIMERO
        browserless_token = os.getenv('BROWSERLESS_TOKEN')
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        
        print(f"[API] Browserless token presente: {bool(browserless_token)}")
        print(f"[API] Gemini API key presente: {bool(gemini_api_key)}")
        
        if not browserless_token:
            error_msg = "BROWSERLESS_TOKEN no está configurado en las variables de entorno de Vercel"
            print(f"[API] ❌ {error_msg}")
            return jsonify({
                'error': 'Error de configuración del servidor',
                'details': error_msg,
                'help': 'Configura BROWSERLESS_TOKEN en Vercel Settings > Environment Variables'
            }), 500
        
        # 2. Obtener y validar datos del request
        request_data = request.get_json()
        print(f"[API] Datos recibidos: {request_data}")
        
        if not request_data:
            return jsonify({'error': 'No se recibieron datos'}), 400
        
        # 3. Extraer y validar parámetros
        tipo_persona = request_data.get('tipoPersona')
        nombres = request_data.get('nombres', '')
        apellido_paterno = request_data.get('apellidoPaterno', '')
        apellido_materno = request_data.get('apellidoMaterno', '')
        nombre_persona_juridica = request_data.get('nombrePersonaJuridica', '')
        año = request_data.get('año')
        competencia = request_data.get('competencia')
        tribunal = request_data.get('tribunal', '')
        corte = request_data.get('corte', '')

        # Validaciones
        if not tipo_persona or tipo_persona not in ['natural', 'juridica']:
            return jsonify({'error': 'Debe especificar tipo de persona: natural o jurídica'}), 400
        
        if tipo_persona == 'natural':
            if not nombres and not apellido_paterno and not apellido_materno:
                return jsonify({'error': 'Para persona natural debe ingresar al menos un campo'}), 400
        elif tipo_persona == 'juridica':
            if not nombre_persona_juridica:
                return jsonify({'error': 'Para persona jurídica debe ingresar el nombre'}), 400
        
        if not año or not competencia:
            return jsonify({'error': 'Año y competencia son obligatorios'}), 400
        
        if competencia != 'Corte Suprema':
            if not tribunal or not corte:
                return jsonify({'error': f'Para {competencia} se requiere tribunal y corte'}), 400

        print(f"[API] ✅ Validación completada")
        
        # 4. Realizar scraping
        print("[API] 🔄 Iniciando scraping...")
        try:
            raw_data = perform_scraping(request_data)
        except Exception as scraping_error:
            print(f"[API] ❌ Error en scraping: {scraping_error}")
            traceback.print_exc()
            return jsonify({
                'error': 'Error al realizar la búsqueda',
                'details': str(scraping_error),
                'type': 'scraping_error'
            }), 500
        
        if not raw_data:
            print("[API] ⚠️ No se encontraron resultados")
            return jsonify({'error': 'No se encontró información para los criterios especificados'}), 404
        
        print(f"[API] ✅ Scraping exitoso: {len(raw_data)} caracteres")
        
        # 5. Traducir con Gemini
        print("[API] 🔄 Traduciendo...")
        try:
            translation = translate_text(raw_data, gemini_api_key)
            print(f"[API] ✅ Traducción completada: {len(translation)} caracteres")
        except Exception as translation_error:
            print(f"[API] ⚠️ Error en traducción (usando básica): {translation_error}")
            translation = translate_text(raw_data, None)

        # 6. Preparar respuesta
        search_info = (
            f"{apellido_paterno} {apellido_materno} {nombres}".strip() 
            if tipo_persona == 'natural' 
            else nombre_persona_juridica
        )

        response_data = {
            "success": True,
            "tipoPersona": tipo_persona,
            "searchInfo": search_info,
            "competencia": competencia,
            "tribunal": tribunal or 'Corte Suprema',
            "corte": corte or 'Corte Suprema',
            "año": año,
            "rawData": raw_data,
            "translation": translation,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        print("[API] ✅ Búsqueda completada exitosamente")
        return jsonify(response_data)

    except Exception as e:
        error_msg = str(e)
        error_type = type(e).__name__
        print(f'[API] ❌ Error inesperado ({error_type}): {error_msg}')
        traceback.print_exc()
        
        return jsonify({
            'error': 'Error interno del servidor',
            'details': error_msg,
            'type': error_type,
            'help': 'Revisa los logs de Vercel para más detalles'
        }), 500

# Para desarrollo local
if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Iniciando servidor Flask (modo desarrollo)")
    print("="*50)
    app.run(debug=True, host='0.0.0.0', port=5000)

# Para Vercel
app = app

# Para Vercel - exportar la app
app = app
