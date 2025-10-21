// ====================================
// JUSTICIA CLARA - BÚSQUEDA POR NOMBRE
// ====================================

document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const tipoPersonaRadios = document.querySelectorAll('input[name="tipo-persona"]');
  const camposPersonaNatural = document.getElementById('campos-persona-natural');
  const camposPersonaJuridica = document.getElementById('campos-persona-juridica');
  const competenciaSelect = document.getElementById('competencia-select');
  const camposDependientes = document.getElementById('campos-dependientes');
  const tribunalSelect = document.getElementById('tribunal-select');
  const corteSelect = document.getElementById('corte-select');
  const form = document.getElementById('form-busqueda-nombre');
  
  // Datos de tribunales y cortes según documento del usuario
  const cortesApelaciones = [
    'C.A. de Arica', 'C.A. de Iquique', 'C.A. de Antofagasta', 'C.A. de Copiapó',
    'C.A. de La Serena', 'C.A. de Valparaíso', 'C.A. de Rancagua', 'C.A. de Talca',
    'C.A. de Chillán', 'C.A. de Concepción', 'C.A. de Temuco', 'C.A. de Valdivia',
    'C.A. de Puerto Montt', 'C.A. de Coyhaique', 'C.A. de Punta Arenas',
    'C.A. de Santiago', 'C.A. de San Miguel'
  ];
  
  const tribunalesPorCompetencia = {
    'Civil': [
      '1º Juzgado Civil de Santiago', '2º Juzgado Civil de Santiago', '3º Juzgado Civil de Santiago',
      '4º Juzgado Civil de Santiago', '5º Juzgado Civil de Santiago', '6º Juzgado Civil de Santiago',
      '1º Juzgado de Letras de Arica', '2º Juzgado de Letras de Arica', '3º Juzgado de Letras de Arica',
      '1º Juzgado Civil de Valparaíso', '2º Juzgado Civil de Valparaíso', '3º Juzgado Civil de Valparaíso'
    ],
    'Laboral': [
      'Juzgado de Letras del Trabajo de Arica', 'Juzgado de Letras del Trabajo de Iquique',
      'Juzgado de Letras del Trabajo de Antofagasta', 'Juzgado de Letras del Trabajo de Copiapó',
      'Juzgado de Letras del Trabajo de La Serena', 'Juzgado de Letras del Trabajo de Valparaíso',
      'Juzgado de Letras del Trabajo de Rancagua', '1º Juzgado de Letras del Trabajo de Santiago',
      '2º Juzgado de Letras del Trabajo de Santiago', 'Juzgado de Letras del Trabajo de San Miguel'
    ],
    'Cobranza': [
      'Jdo. de Letras y Garantía de Pozo Almonte', 'Juzgado de Letras de Tocopilla',
      'Juzgado de Letras y Garantía de Maria Elena', '1º Juzgado de Letras de Vallenar',
      '2º Juzgado de Letras de Vallenar', '1º Juzgado de Letras de Ovalle'
    ],
    'Penal': [
      'Juzgado De Letras Y Garantía De Pozo Almonte', 'Juzgado De Letras Y Garantía De María Elena',
      'Juzgado De Letras Y Garantía De Taltal', 'Juzgado De Letras Y Garantía De Chañaral',
      'Tribunal De Juicio Oral En Lo Penal De Arica', 'Tribunal De Juicio Oral En Lo Penal De Iquique'
    ]
  };
  
  // Manejar cambio de tipo de persona
  if (tipoPersonaRadios.length > 0) {
    tipoPersonaRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.value === 'natural') {
          if (camposPersonaNatural) camposPersonaNatural.classList.remove('hidden');
          if (camposPersonaJuridica) camposPersonaJuridica.classList.add('hidden');
        } else {
          if (camposPersonaNatural) camposPersonaNatural.classList.add('hidden');
          if (camposPersonaJuridica) camposPersonaJuridica.classList.remove('hidden');
        }
      });
    });
  }
  
  // Manejar cambio de competencia
  if (competenciaSelect) {
    competenciaSelect.addEventListener('change', function() {
      const competencia = this.value;
      
      if (competencia === 'Corte Suprema') {
        // Corte Suprema no requiere tribunal ni corte
        if (camposDependientes) camposDependientes.classList.add('hidden');
        if (tribunalSelect) tribunalSelect.disabled = true;
        if (corteSelect) corteSelect.disabled = true;
      } else if (competencia) {
        if (camposDependientes) camposDependientes.classList.remove('hidden');
        
        // Habilitar y cargar tribunales
        if (tribunalSelect) {
          tribunalSelect.disabled = false;
          tribunalSelect.innerHTML = '<option value="">Seleccione Tribunal</option>';
          
          if (tribunalesPorCompetencia[competencia]) {
            tribunalesPorCompetencia[competencia].forEach(tribunal => {
              const option = document.createElement('option');
              option.value = tribunal;
              option.textContent = tribunal;
              tribunalSelect.appendChild(option);
            });
          }
        }
        
        // Cargar cortes de apelaciones
        if (corteSelect) {
          corteSelect.disabled = false;
          corteSelect.innerHTML = '<option value="">Seleccione Corte</option>';
          cortesApelaciones.forEach(corte => {
            const option = document.createElement('option');
            option.value = corte;
            option.textContent = corte;
            corteSelect.appendChild(option);
          });
        }
      } else {
        if (camposDependientes) camposDependientes.classList.add('hidden');
        if (tribunalSelect) tribunalSelect.disabled = true;
        if (corteSelect) corteSelect.disabled = true;
      }
    });
  }
  
  // Manejar envío del formulario
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Mostrar loading
      showLoading('Iniciando búsqueda...', 'Preparando consulta...');
      hideMessages();
      
      try {
        // Recopilar datos del formulario
        const formData = new FormData(this);
        const tipoPersona = formData.get('tipo-persona');
        
        const requestData = {
          tipoPersona: tipoPersona,
          año: formData.get('año'),
          competencia: formData.get('competencia'),
          tribunal: formData.get('tribunal'),
          corte: formData.get('corte')
        };
        
        if (tipoPersona === 'natural') {
          requestData.nombres = formData.get('nombres');
          requestData.apellidoPaterno = formData.get('apellido-paterno');
          requestData.apellidoMaterno = formData.get('apellido-materno');
        } else {
          requestData.nombrePersonaJuridica = formData.get('nombre-persona-juridica');
        }
        
        // ====== PASO 1: SCRAPING (50 segundos) ======
        showLoading('Paso 1 de 2: Extrayendo información...', 'Conectando al sistema judicial (esto puede tomar hasta 50 segundos)');
        
        const scrapingResponse = await fetch('/api/scraping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });
        
        const scrapingResult = await scrapingResponse.json();
        
        if (!scrapingResult.success) {
          showError(scrapingResult.error || 'Error en la extracción de datos');
          hideLoading();
          return;
        }
        
        console.log('✅ Scraping completado:', scrapingResult);
        
        // ====== PASO 2: TRADUCCIÓN (10+ segundos) ======
        showLoading('Paso 2 de 2: Traduciendo a lenguaje simple...', 'Procesando información con Inteligencia Artificial (esto puede tomar hasta 15 segundos)');
        
        const traducirResponse = await fetch('/api/traducir', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rawData: scrapingResult.rawData
          })
        });
        
        const traducirResult = await traducirResponse.json();
        
        if (!traducirResult.success) {
          showError(traducirResult.error || 'Error en la traducción');
          hideLoading();
          return;
        }
        
        console.log('✅ Traducción completada:', traducirResult);
        
        // Combinar resultados
        const finalResult = {
          ...scrapingResult,
          translation: traducirResult.translation
        };
        
        showResults(finalResult);
        
      } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión. Verifique su conexión a internet.');
      } finally {
        hideLoading();
      }
    });
  }
});

function showLoading(text = 'Consultando información...', subtext = 'Esto puede tomar hasta 20 segundos.') {
  const loading = document.getElementById('loading');
  if (loading) {
    // Actualizar textos
    const loadingText = loading.querySelector('.loading-text');
    const loadingSubtext = loading.querySelector('.loading-subtext');
    
    if (loadingText) loadingText.textContent = text;
    if (loadingSubtext) loadingSubtext.textContent = subtext;
    
    loading.classList.remove('hidden');
  }
}

function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        errorDiv.classList.remove('hidden');
        errorDiv.scrollIntoView({
            behavior: 'smooth'
        });
    }
}


function hideMessages() {
    const error = document.getElementById('error');
    const results = document.getElementById('results');
    if (error) error.classList.add('hidden');
    if (results) {
        results.classList.add('hidden');
        results.innerHTML = ''; // Limpiar resultados anteriores
    }
}

function showResults(data) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;

    // Sanitizar y formatear el texto de traducción
    const formattedTranslation = data.translation.replace(/\n/g, '<br>');

    const resultsHTML = `
    <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 md:p-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
        <div>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">Resultados de la Búsqueda</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Mostrando resultados para: <span class="font-semibold">${data.searchInfo}</span>
          </p>
        </div>
        <div class="flex items-center gap-2 mt-4 md:mt-0">
          <button onclick="window.print()" class="flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <span class="material-symbols-outlined text-base">print</span>
            Imprimir
          </button>
          <button onclick="nuevaBusqueda()" class="flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <span class="material-symbols-outlined text-base">search</span>
            Nueva Búsqueda
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Columna de Datos Originales -->
        <div class="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <h3 class="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-primary">gavel</span>
            Datos Originales
          </h3>
          <div class="h-96 overflow-y-auto pr-2 text-sm text-zinc-700 dark:text-zinc-300">
            <pre class="whitespace-pre-wrap font-mono">${data.rawData}</pre>
          </div>
        </div>

        <!-- Columna de Explicación Simple -->
        <div class="p-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
          <h3 class="text-lg font-bold text-primary flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined">lightbulb</span>
            Explicación en Lenguaje Simple
          </h3>
          <div class="h-96 overflow-y-auto pr-2 text-base text-zinc-800 dark:text-zinc-200 space-y-4">
            ${formattedTranslation}
          </div>
        </div>
      </div>
    </div>
  `;

    resultsDiv.innerHTML = resultsHTML;
    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({
        behavior: 'smooth'
    });
}

// Asegúrate de que esta función esté disponible globalmente si se llama desde el HTML
window.nuevaBusqueda = function() {
    hideMessages();
    const form = document.getElementById('form-busqueda-nombre');
    if (form) {
        form.reset();
        // Disparar evento de cambio para que la lógica de visibilidad se aplique
        document.querySelector('input[name="tipo-persona"][value="natural"]').dispatchEvent(new Event('change'));
    }
    // Opcional: volver al formulario
    const formContainer = document.getElementById('form-busqueda-nombre');
    if (formContainer) {
        formContainer.scrollIntoView({
            behavior: 'smooth'
        });
    }
}