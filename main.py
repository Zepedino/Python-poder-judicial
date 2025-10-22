from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from dotenv import load_dotenv
import os
import datetime
from modules.scraper import perform_scraping
from modules.ai_translator import translate_text
from modules.auth import (
    authenticate_user, 
    login_required, 
    admin_required,
    client_required,
    create_session,
    destroy_session,
    get_current_user,
    is_authenticated,
    get_user_plan
)
from modules.database import (
    save_search,
    get_user_searches,
    get_search_by_id,
    delete_search,
    get_search_stats
)

load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = os.getenv('SECRET_KEY', 'justicia-clara-secret-key-change-in-production')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

@app.route('/')
def index():
    """Página principal - redirige según el estado de autenticación"""
    if not is_authenticated():
        # Si no está autenticado, redirige al login
        return redirect(url_for('login'))
    
    user = get_current_user()
    # Si es admin, va al dashboard
    if user and user.get('role') == 'admin':
        return redirect(url_for('dashboard'))
    # Si es cliente, va a la aplicación
    return redirect(url_for('app_page'))

@app.route('/api/scraping', methods=['POST'])
@login_required
def api_scraping():
    """
    Endpoint 1: Solo realiza el scraping (para no exceder 60s de Vercel)
    Retorna los datos crudos del scraping
    """
    try:
        request_data = request.get_json()
        
        tipo_persona = request_data.get('tipoPersona')
        nombres = request_data.get('nombres')
        apellido_paterno = request_data.get('apellidoPaterno')
        apellido_materno = request_data.get('apellidoMaterno')
        nombre_persona_juridica = request_data.get('nombrePersonaJuridica')
        año = request_data.get('año')
        competencia = request_data.get('competencia')
        tribunal = request_data.get('tribunal')
        corte = request_data.get('corte')

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

        # Realizar solo el scraping
        raw_data = perform_scraping(request_data)
        
        if not raw_data:
            return jsonify({'error': 'No se encontró información para los criterios especificados'}), 404

        search_info = f"{apellido_paterno or ''} {apellido_materno or ''} {nombres or ''}".strip() if tipo_persona == 'natural' else nombre_persona_juridica

        # Retornar datos crudos para que el cliente llame al segundo endpoint
        return jsonify({
            "success": True,
            "tipoPersona": tipo_persona,
            "searchInfo": search_info,
            "competencia": competencia,
            "tribunal": tribunal or 'Corte Suprema',
            "corte": corte or 'Corte Suprema',
            "año": año,
            "rawData": raw_data,
            "timestamp": datetime.datetime.now().isoformat()
        })

    except Exception as e:
        print(f'Error en scraping: {e}')
        return jsonify({
            'error': 'Error interno del servidor',
            'details': str(e)
        }), 500

@app.route('/api/translate', methods=['POST'])
@login_required
def api_translate():
    """
    Endpoint 2: Solo realiza la traducción con IA (para no exceder 60s de Vercel)
    Recibe rawData y retorna la traducción
    """
    try:
        request_data = request.get_json()
        raw_data = request_data.get('rawData')
        
        if not raw_data:
            return jsonify({'error': 'rawData es requerido'}), 400
        
        # Realizar solo la traducción
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        translation = translate_text(raw_data, gemini_api_key)

        return jsonify({
            "success": True,
            "translation": translation,
            "timestamp": datetime.datetime.now().isoformat()
        })

    except Exception as e:
        print(f'Error en traducción: {e}')
        return jsonify({
            'error': 'Error interno del servidor',
            'details': str(e)
        }), 500

@app.route('/login', methods=['GET'])
def login():
    """Muestra el formulario de login"""
    if is_authenticated():
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    """Procesa el login de usuario"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400
        
        user = authenticate_user(username, password)
        
        if user:
            create_session(user)
            
            # Determinar redirección según el rol
            redirect_url = '/dashboard' if user.get('role') == 'admin' else '/'
            
            return jsonify({
                'success': True,
                'message': 'Login exitoso',
                'user': user,
                'redirect': redirect_url
            })
        else:
            return jsonify({'error': 'Credenciales inválidas'}), 401
            
    except Exception as e:
        print(f'Error en login: {e}')
        return jsonify({'error': 'Error en el servidor'}), 500

@app.route('/logout', methods=['POST'])
def logout():
    """Cierra la sesión del usuario"""
    destroy_session()
    return jsonify({'success': True, 'message': 'Sesión cerrada correctamente'})

@app.route('/app')
@login_required
def app_page():
    """Página de la aplicación para usuarios autenticados"""
    user = get_current_user()
    return render_template('index.html', user=user)

@app.route('/dashboard')
@admin_required
def dashboard():
    """Panel de administración - solo para admins"""
    user = get_current_user()
    return render_template('dashboard.html', user=user)

@app.route('/api/dashboard/stats')
@admin_required
def dashboard_stats():
    """Obtiene estadísticas para el dashboard"""
    # Aquí puedes implementar lógica real de estadísticas
    # Por ahora devolvemos datos de ejemplo
    return jsonify({
        'searches_today': 152,
        'active_users': 48,
        'cases_processed': 1234,
        'avg_time': 8.3,
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/save-search', methods=['POST'])
@login_required
def api_save_search():
    """
    Guarda una búsqueda realizada por el usuario
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Usuario no autenticado'}), 401
        
        search_data = request.get_json()
        
        # Guardar la búsqueda en la base de datos
        search_id = save_search(user['username'], search_data)
        
        return jsonify({
            'success': True,
            'search_id': search_id,
            'message': 'Búsqueda guardada exitosamente'
        })
    
    except Exception as e:
        print(f'Error guardando búsqueda: {e}')
        return jsonify({'error': 'Error guardando búsqueda', 'details': str(e)}), 500

@app.route('/historial')
@login_required
def historial():
    """Página de historial de búsquedas del usuario"""
    user = get_current_user()
    if not user:
        return redirect(url_for('login'))
    
    # Si es admin, redirigir al dashboard
    if user.get('role') == 'admin':
        return redirect(url_for('dashboard'))
    
    return render_template('historial.html', user=user)

@app.route('/api/historial', methods=['GET'])
@login_required
def api_historial():
    """Obtiene el historial de búsquedas del usuario"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Usuario no autenticado'}), 401
        
        # Obtener parámetros opcionales
        limit = request.args.get('limit', type=int)
        
        # Obtener búsquedas del usuario
        searches = get_user_searches(user['username'], limit=limit)
        
        # Obtener estadísticas
        stats = get_search_stats(user['username'])
        
        return jsonify({
            'success': True,
            'searches': searches,
            'stats': stats,
            'user_plan': get_user_plan()
        })
    
    except Exception as e:
        print(f'Error obteniendo historial: {e}')
        return jsonify({'error': 'Error obteniendo historial', 'details': str(e)}), 500

@app.route('/api/historial/<search_id>', methods=['GET'])
@login_required
def api_get_search(search_id):
    """Obtiene una búsqueda específica por ID"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Usuario no autenticado'}), 401
        
        search = get_search_by_id(search_id)
        
        if not search:
            return jsonify({'error': 'Búsqueda no encontrada'}), 404
        
        # Verificar que la búsqueda pertenece al usuario
        if search.get('user_id') != user['username']:
            return jsonify({'error': 'Acceso denegado'}), 403
        
        return jsonify({
            'success': True,
            'search': search
        })
    
    except Exception as e:
        print(f'Error obteniendo búsqueda: {e}')
        return jsonify({'error': 'Error obteniendo búsqueda', 'details': str(e)}), 500

@app.route('/api/historial/<search_id>', methods=['DELETE'])
@login_required
def api_delete_search(search_id):
    """Elimina una búsqueda específica"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Usuario no autenticado'}), 401
        
        deleted = delete_search(search_id, user['username'])
        
        if not deleted:
            return jsonify({'error': 'Búsqueda no encontrada o acceso denegado'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Búsqueda eliminada exitosamente'
        })
    
    except Exception as e:
        print(f'Error eliminando búsqueda: {e}')
        return jsonify({'error': 'Error eliminando búsqueda', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
