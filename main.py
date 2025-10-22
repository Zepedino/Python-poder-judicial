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
    create_session,
    destroy_session,
    get_current_user,
    is_authenticated
)

load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = os.getenv('SECRET_KEY', 'justicia-clara-secret-key-change-in-production')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

@app.route('/')
def index():
    """Página principal - redirige según el estado de autenticación"""
    if is_authenticated():
        user = get_current_user()
        # Si es admin, va al dashboard
        if user and user.get('role') == 'admin':
            return redirect(url_for('dashboard'))
        # Si es usuario normal, va a la aplicación
        return render_template('index.html', user=user)
    # Si no está autenticado, redirige al login
    return redirect(url_for('login'))

@app.route('/api/buscar-nombre', methods=['POST'])
def buscar_nombre():
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

        raw_data = perform_scraping(request_data)
        
        if not raw_data:
            return jsonify({'error': 'No se encontró información para los criterios especificados'}), 404
            
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        translation = translate_text(raw_data, gemini_api_key)

        search_info = f"{apellido_paterno or ''} {apellido_materno or ''} {nombres or ''}".strip() if tipo_persona == 'natural' else nombre_persona_juridica

        return jsonify({
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
        })

    except Exception as e:
        print(f'Error en búsqueda por nombre: {e}')
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

if __name__ == '__main__':
    app.run(debug=True)
