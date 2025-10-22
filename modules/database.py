"""
Módulo de base de datos simple con archivos JSON
Almacena búsquedas de usuarios y historial de causas
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional
import uuid

# Directorio de almacenamiento
DATA_DIR = '/tmp/justicia_clara_data'
SEARCHES_FILE = os.path.join(DATA_DIR, 'searches.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')

def init_database():
    """Inicializa el directorio y archivos de base de datos"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    if not os.path.exists(SEARCHES_FILE):
        with open(SEARCHES_FILE, 'w') as f:
            json.dump([], f)
    
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump({}, f)

def save_search(user_id: str, search_data: Dict) -> str:
    """
    Guarda una búsqueda realizada por un usuario
    
    Args:
        user_id: ID del usuario que realizó la búsqueda
        search_data: Datos de la búsqueda incluyendo rawData, translation, etc.
    
    Returns:
        str: ID único de la búsqueda guardada
    """
    init_database()
    
    search_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    search_record = {
        'id': search_id,
        'user_id': user_id,
        'timestamp': timestamp,
        'tipo_persona': search_data.get('tipoPersona'),
        'search_info': search_data.get('searchInfo'),
        'competencia': search_data.get('competencia'),
        'tribunal': search_data.get('tribunal'),
        'corte': search_data.get('corte'),
        'año': search_data.get('año'),
        'raw_data': search_data.get('rawData'),
        'translation': search_data.get('translation', '')
    }
    
    # Leer búsquedas existentes
    with open(SEARCHES_FILE, 'r') as f:
        searches = json.load(f)
    
    # Agregar nueva búsqueda
    searches.append(search_record)
    
    # Guardar de vuelta
    with open(SEARCHES_FILE, 'w') as f:
        json.dump(searches, f, indent=2, ensure_ascii=False)
    
    return search_id

def get_user_searches(user_id: str, limit: Optional[int] = None) -> List[Dict]:
    """
    Obtiene todas las búsquedas de un usuario específico
    
    Args:
        user_id: ID del usuario
        limit: Límite opcional de resultados a retornar
    
    Returns:
        List[Dict]: Lista de búsquedas ordenadas por fecha descendente
    """
    init_database()
    
    try:
        with open(SEARCHES_FILE, 'r') as f:
            searches = json.load(f)
    except:
        return []
    
    # Filtrar por usuario
    user_searches = [s for s in searches if s.get('user_id') == user_id]
    
    # Ordenar por timestamp descendente
    user_searches.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    
    # Aplicar límite si se especifica
    if limit:
        user_searches = user_searches[:limit]
    
    return user_searches

def get_search_by_id(search_id: str) -> Optional[Dict]:
    """
    Obtiene una búsqueda específica por su ID
    
    Args:
        search_id: ID de la búsqueda
    
    Returns:
        Optional[Dict]: Datos de la búsqueda o None si no existe
    """
    init_database()
    
    try:
        with open(SEARCHES_FILE, 'r') as f:
            searches = json.load(f)
    except:
        return None
    
    for search in searches:
        if search.get('id') == search_id:
            return search
    
    return None

def delete_search(search_id: str, user_id: str) -> bool:
    """
    Elimina una búsqueda específica (solo si pertenece al usuario)
    
    Args:
        search_id: ID de la búsqueda a eliminar
        user_id: ID del usuario (para verificar propiedad)
    
    Returns:
        bool: True si se eliminó, False si no se encontró o no pertenece al usuario
    """
    init_database()
    
    try:
        with open(SEARCHES_FILE, 'r') as f:
            searches = json.load(f)
    except:
        return False
    
    # Buscar y eliminar
    new_searches = []
    found = False
    
    for search in searches:
        if search.get('id') == search_id and search.get('user_id') == user_id:
            found = True
            continue  # No agregar esta búsqueda (eliminarla)
        new_searches.append(search)
    
    if found:
        with open(SEARCHES_FILE, 'w') as f:
            json.dump(new_searches, f, indent=2, ensure_ascii=False)
        return True
    
    return False

def get_search_stats(user_id: str) -> Dict:
    """
    Obtiene estadísticas de búsquedas de un usuario
    
    Args:
        user_id: ID del usuario
    
    Returns:
        Dict: Estadísticas incluyendo total, por competencia, etc.
    """
    searches = get_user_searches(user_id)
    
    stats = {
        'total': len(searches),
        'por_competencia': {},
        'por_mes': {},
        'ultima_busqueda': None
    }
    
    if not searches:
        return stats
    
    stats['ultima_busqueda'] = searches[0].get('timestamp')
    
    for search in searches:
        # Contar por competencia
        competencia = search.get('competencia', 'Sin especificar')
        stats['por_competencia'][competencia] = stats['por_competencia'].get(competencia, 0) + 1
        
        # Contar por mes
        try:
            timestamp = search.get('timestamp', '')
            mes = timestamp[:7]  # YYYY-MM
            stats['por_mes'][mes] = stats['por_mes'].get(mes, 0) + 1
        except:
            pass
    
    return stats
