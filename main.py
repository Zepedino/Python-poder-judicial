from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
import datetime
from modules.scraper import perform_scraping
from modules.ai_translator import translate_text

load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='static')

@app.route('/')
def index():
    return render_template('index.html')

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

if __name__ == '__main__':
    app.run(debug=True)
