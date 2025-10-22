"""
Módulo de autenticación para el sistema de administración
Maneja login, sesiones y verificación de usuarios
"""

from functools import wraps
from flask import session, redirect, url_for, jsonify
import hashlib
import os
from datetime import datetime, timedelta

# Usuarios hardcoded (en producción esto debería estar en una base de datos)
USERS_DB = {
    'admin': {
        'password_hash': hashlib.sha256('admin123'.encode()).hexdigest(),
        'role': 'admin',
        'name': 'Administrador Principal',
        'email': 'admin@justiciaclara.cl'
    },
    # Clientes de ejemplo
    'cliente1': {
        'password_hash': hashlib.sha256('cliente123'.encode()).hexdigest(),
        'role': 'cliente',
        'name': 'Juan Pérez',
        'email': 'juan.perez@email.com',
        'plan': 'basico'
    },
    'cliente2': {
        'password_hash': hashlib.sha256('cliente123'.encode()).hexdigest(),
        'role': 'cliente',
        'name': 'María González',
        'email': 'maria.gonzalez@email.com',
        'plan': 'premium'
    }
}

def hash_password(password):
    """Genera hash SHA256 de una contraseña"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(username, password):
    """Verifica credenciales de usuario"""
    user = USERS_DB.get(username)
    if not user:
        return False
    
    password_hash = hash_password(password)
    return password_hash == user['password_hash']

def authenticate_user(username, password):
    """Autentica un usuario y devuelve sus datos si es válido"""
    if verify_password(username, password):
        user_data = USERS_DB[username].copy()
        user_data['username'] = username
        del user_data['password_hash']
        return user_data
    return None

def login_required(f):
    """Decorador para proteger rutas que requieren autenticación"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorador para proteger rutas que requieren rol de administrador"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        
        user = session.get('user')
        if user.get('role') != 'admin':
            return jsonify({'error': 'Acceso denegado. Se requiere rol de administrador.'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def create_session(user_data):
    """Crea una sesión de usuario"""
    session['user'] = user_data
    session['login_time'] = datetime.now().isoformat()
    session.permanent = True

def destroy_session():
    """Destruye la sesión actual"""
    session.pop('user', None)
    session.pop('login_time', None)

def get_current_user():
    """Obtiene el usuario actual de la sesión"""
    return session.get('user')

def is_authenticated():
    """Verifica si hay un usuario autenticado"""
    return 'user' in session

def client_required(f):
    """Decorador para proteger rutas que requieren ser cliente (no admin)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        
        user = session.get('user')
        if user.get('role') not in ['cliente', 'admin']:  # Admin también puede acceder
            return jsonify({'error': 'Acceso denegado. Se requiere ser cliente.'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def get_user_role():
    """Obtiene el rol del usuario actual"""
    user = get_current_user()
    if user:
        return user.get('role')
    return None

def is_admin():
    """Verifica si el usuario actual es admin"""
    return get_user_role() == 'admin'

def is_client():
    """Verifica si el usuario actual es cliente"""
    return get_user_role() == 'cliente'

def get_user_plan():
    """Obtiene el plan del usuario (solo para clientes)"""
    user = get_current_user()
    if user and user.get('role') == 'cliente':
        return user.get('plan', 'basico')
    return None
