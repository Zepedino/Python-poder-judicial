from flask import Flask, render_template, request, jsonify
import os
import sys
import datetime
import traceback

# Configurar paths
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Importar módulos
try:
    from modules.scraper import perform_scraping
    from modules.ai_translator import translate_text
except ImportError as e:
    print(f"Error importando módulos: {e}")
    print(f"Current dir: {current_dir}")
    print(f"Parent dir: {parent_dir}")
    print(f"sys.path: {sys.path}")
    raise

# Configurar Flask
app = Flask(
    __name__,
    template_folder=os.path.join(parent_dir, 'templates'),
    static_folder=os.path.join(parent_dir, 'static'),
    static_url_path='/static'
)

# Configuración
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/api/buscar-nombre', methods=['POST'])
def buscar_nombre():
    """Endpoint para búsqueda por nombre"""
    try:
        # Obtener datos del request
        request_data = request.get_json()
        
        if not request_data:
            return jsonify({'error': 'No se recibieron datos'}), 400
        
        # Extraer parámetros
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
                return jsonify({'error': 'Para persona natural debe ingresar al menos: nombres, apellido paterno o apellido materno'}), 400
        elif tipo_persona == 'juridica':
            if not nombre_persona_juridica:
                return jsonify({'error': 'Para persona jurídica debe ingresar el nombre de la empresa/organización'}), 400
        
        if not año or not competencia:
            return jsonify({'error': 'Año y competencia son obligatorios'}), 400
        
        if competencia != 'Corte Suprema':
            if not tribunal or not corte:
                return jsonify({'error': f'Para {competencia} se requiere tribunal y corte'}), 400

        # Verificar variables de entorno ANTES del scraping
        browserless_token = os.getenv('BROWSERLESS_TOKEN')
        if not browserless_token:
            print("[ERROR] BROWSERLESS_TOKEN no configurado")
            return jsonify({
                'error': 'Configuración del servidor incorrecta',
                'details': 'BROWSERLESS_TOKEN no está configurado. Por favor contacte al administrador.'
            }), 500

        # Log para debug
        print(f"[INFO] Iniciando búsqueda:")
        print(f"  - Tipo: {tipo_persona}")
        print(f"  - Año: {año}")
        print(f"  - Competencia: {competencia}")
        print(f"  - Browserless configurado: {bool(browserless_token)}")
        
        # Realizar scraping
        print("[INFO] Llamando a perform_scraping...")
        raw_data = perform_scraping(request_data)
        
        if not raw_data:
            print("[WARNING] No se encontraron resultados")
            return jsonify({'error': 'No se encontró información para los criterios especificados'}), 404
        
        print(f"[INFO] Scraping exitoso. Datos obtenidos: {len(raw_data)} caracteres")
        
        # Traducir con Gemini
        print("[INFO] Iniciando traducción con Gemini...")
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        
        if not gemini_api_key:
            print("[WARNING] GEMINI_API_KEY no encontrada, usando traductor básico")
        
        translation = translate_text(raw_data, gemini_api_key)
        print("[INFO] Traducción completada")

        # Preparar respuesta
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
        
        print("[SUCCESS] Búsqueda completada exitosamente")
        return jsonify(response_data)

    except ValueError as e:
        error_msg = str(e)
        print(f'[ERROR] Error de validación: {error_msg}')
        traceback.print_exc()
        return jsonify({
            'error': 'Error en los datos proporcionados',
            'details': error_msg
        }), 400
        
    except Exception as e:
        error_msg = str(e)
        print(f'[ERROR] Error inesperado: {error_msg}')
        traceback.print_exc()
        
        # Errores específicos de Browserless
        if 'browserless' in error_msg.lower() or 'token' in error_msg.lower():
            return jsonify({
                'error': 'Error de conexión con el navegador remoto',
                'details': 'No se pudo conectar al servicio de navegación. Verifique la configuración de BROWSERLESS_TOKEN.'
            }), 500
        
        return jsonify({
            'error': 'Error interno del servidor',
            'details': error_msg,
            'type': type(e).__name__
        }), 500

@app.route('/health')
def health():
    """Endpoint de salud para verificar que el servicio está funcionando"""
    browserless_configured = bool(os.getenv('BROWSERLESS_TOKEN'))
    gemini_configured = bool(os.getenv('GEMINI_API_KEY'))
    
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.datetime.now().isoformat(),
        'browserless_configured': browserless_configured,
        'gemini_configured': gemini_configured,
        'python_version': sys.version,
        'environment': 'vercel' if os.getenv('VERCEL') else 'local'
    })

# Para desarrollo local
if __name__ == '__main__':
    print("Iniciando servidor Flask en modo desarrollo...")
    app.run(debug=True, host='0.0.0.0', port=5000)

# Para Vercel - exportar la app
app = app
