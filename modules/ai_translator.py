import google.generativeai as genai

def translate_text(legal_text: str, api_key: str) -> str:
    """
    Traduce el texto legal a un lenguaje simple usando la API de Gemini,
    o recurre a una traducción básica y profesional si no hay API key.
    """
    if not api_key:
        print("INFO: No se encontró la clave de API de Gemini, usando el traductor básico profesional.")
        return generate_basic_translation(legal_text)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')

        # Prompt ajustado para solicitar formato HTML para las negritas.
        prompt = f"""
Eres un traductor jurídico especializado. Tu tarea es traducir información judicial técnica a un lenguaje simple, profesional y comprensible para el ciudadano común.

Instrucciones:
1. Mantén la información factual exacta.
2. Explica términos jurídicos en lenguaje simple.
3. Estructura la respuesta de forma clara y sobria. No uses emojis.
4. Para destacar texto, usa las etiquetas HTML <b> y </b> en lugar de asteriscos o markdown.
5. Resume los hitos más importantes del historial de movimientos.

Formato de respuesta requerido:
<b>RESUMEN DE LA CAUSA</b>

<b>Tipo de Causa:</b>
[Explicación simple del tipo de causa y los involucrados]

<b>Estado Actual:</b>
[Estado actual explicado en lenguaje simple]

<b>Historial Reciente:</b>
[Resumen de 2-3 actuaciones importantes del historial]

<b>Próximos Pasos:</b>
[Próximos pasos sugeridos basados en el estado actual]

<b>Recomendación Importante:</b>
[Párrafo sobre la importancia de consultar a un abogado]

---

TEXTO LEGAL A TRADUCIR:
{legal_text}
"""
        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"Error con Gemini AI: {e}. Usando el traductor básico profesional.")
        return generate_basic_translation(legal_text)

def generate_basic_translation(legal_text: str) -> str:
    """
    Genera un resumen profesional y claro del texto legal, usando etiquetas HTML <b>
    para el texto en negrita, asegurando que no se vean los asteriscos.
    """
    lines = legal_text.splitlines()
    
    rol = 'No disponible'
    caratula = 'No disponible'
    estado = 'No disponible'
    tipo_recurso = 'No disponible'
    historial = []

    is_historial = False
    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue

        if cleaned_line.upper().startswith('HISTORIAL DE MOVIMIENTOS:'):
            is_historial = True
            continue

        if is_historial and cleaned_line.startswith('-'):
            historial.append(cleaned_line.lstrip('- ').strip())
        elif not is_historial:
            if cleaned_line.upper().startswith('ROL:'):
                rol = cleaned_line.split(':', 1)[1].strip()
            elif cleaned_line.upper().startswith('CARATULADO:'):
                caratula = cleaned_line.split(':', 1)[1].strip()
            elif cleaned_line.upper().startswith('ESTADO CAUSA:'):
                estado = cleaned_line.split(':', 1)[1].strip()
            elif cleaned_line.upper().startswith('TIPO RECURSO:'):
                tipo_recurso = cleaned_line.split(':', 1)[1].strip()

    estado_explicacion = {
        'En tramitación': 'La causa está avanzando y siendo procesada por el tribunal.',
        'Terminada': 'El tribunal ya tomó una decisión final en este caso.',
        'Suspendida': 'El proceso está en una pausa temporal, a la espera de alguna acción o plazo.',
        'En Acuerdo': 'Los jueces ya revisaron el caso y están deliberando para tomar una decisión. Pronto habrá una resolución.',
        'En Relación': 'La causa ha sido asignada a una sala de la Corte para ser revisada y programada para una audiencia.'
    }.get(estado, f'El estado es "{estado}", lo que usualmente significa que está en una etapa administrativa o archivada.')

    resumen_historial = ""
    if historial:
        for item in historial[:3]:
            resumen_historial += f"- {item}\n"
    else:
        resumen_historial = "No se encontró un historial de movimientos detallado."

    # --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    # Usamos etiquetas <b> en lugar de ** para el texto en negrita.
    return f"""
<b>RESUMEN DE LA CAUSA</b>

<b>Tipo de Causa:</b>
Es un proceso de tipo <b>{tipo_recurso}</b>, caratulado como <b>{caratula}</b>, que involucra a las partes mencionadas en ese nombre.

<b>Estado Actual:</b>
El estado actual es <b>{estado}</b>. Esto significa que {estado_explicacion.lower()}

<b>Historial Reciente:</b>
Los últimos movimientos importantes en la causa son:
{resumen_historial}
<b>Próximos Pasos:</b>
Dado el estado actual, es probable que el siguiente paso sea la emisión de una nueva resolución o la notificación de una decisión del tribunal. Se recomienda estar atento a las próximas comunicaciones.

<b>Recomendación Importante:</b>
Esta es una explicación básica. Para entender completamente su situación legal y los mejores pasos a seguir, es <b>muy recomendable consultar con un abogado</b> que pueda revisar los detalles específicos del caso y asesorarle correctamente.
"""