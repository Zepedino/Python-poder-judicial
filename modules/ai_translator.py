import google.generativeai as genai

def translate_text(legal_text: str, api_key: str) -> str:
    if not api_key:
        return generate_basic_translation(legal_text)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt = f"""
Eres un traductor jurídico especializado. Tu tarea es traducir información judicial técnica a lenguaje simple y comprensible para el ciudadano común.

Instrucciones:
1. Mantén la información factual exacta
2. Explica términos jurídicos en lenguaje simple
3. Estructura la respuesta de forma clara
4. Incluye una explicación de qué significa cada estado procesal
5. Sugiere posibles próximos pasos

Formato de respuesta requerido:
**RESUMEN DE TU CAUSA**

**¿Qué tipo de caso es?**
[Explicación simple del tipo de causa]

**¿Quiénes están involucrados?**
[Explicación de las partes]

**¿En qué estado se encuentra?**
[Estado actual explicado en lenguaje simple]

**¿Qué ha pasado hasta ahora?**
[Resumen de actuaciones importantes]

**¿Qué viene después?**
[Próximos pasos explicados]

**¿Qué significa esto para ti?**
[Implicaciones prácticas]

---

TEXTO LEGAL A TRADUCIR:
{legal_text}
"""

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"Error con Gemini AI: {e}")
        return generate_basic_translation(legal_text)

def generate_basic_translation(legal_text: str) -> str:
    lines = legal_text.split('\\n')
    
    rol = next((line.split(':')[1].strip() for line in lines if 'ROL:' in line), 'No disponible')
    caratula = next((line.split(':')[1].strip() for line in lines if 'CARÁTULA:' in line), 'No disponible')
    estado = next((line.split(':')[1].strip() for line in lines if 'ESTADO PROCESAL:' in line), 'No disponible')
    
    estado_explicacion = {
        'En tramitación': 'Tu causa está siendo procesada y aún no ha terminado.',
        'Terminada': 'Tu causa ya fue resuelta por el tribunal.',
        'Suspendida': 'Tu causa está temporalmente detenida.',
    }.get(estado, 'Tu causa está archivada en el tribunal.')

    return f"""**RESUMEN DE TU CAUSA**

**¿Qué tipo de caso es?**
Tu causa "{caratula}" es un proceso judicial que se está tramitando en los tribunales.

**Estado actual: {estado}**
{estado_explicacion}

**¿Qué significa esto?**
- Si está "en tramitación": El proceso judicial está avanzando
- Si está "terminada": Ya hay una resolución final
- Si está "suspendida": Hay una pausa temporal en el proceso
- Si está "archivada": El expediente está guardado sin movimiento

**Información importante:**
Esta es una explicación básica. Para entender completamente tu situación legal, es recomendable consultar con un abogado que pueda revisar los detalles específicos de tu caso.

**Próximos pasos sugeridos:**
1. Revisa regularmente el estado de tu causa
2. Mantén contacto con tu representante legal
3. Cumple con las citaciones y requerimientos del tribunal
"""
