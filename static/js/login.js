/**
 * Módulo de Login - Justicia Clara
 * Maneja la autenticación de usuarios administradores
 */

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  const submitButton = document.getElementById('submit-button');
  const errorMessage = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');

  /**
   * Muestra un mensaje de error
   */
  function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
  }

  /**
   * Oculta el mensaje de error
   */
  function hideError() {
    errorMessage.classList.add('hidden');
  }

  /**
   * Deshabilita el botón de submit
   */
  function disableSubmit() {
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Iniciando sesión...
    `;
  }

  /**
   * Habilita el botón de submit
   */
  function enableSubmit() {
    submitButton.disabled = false;
    submitButton.innerHTML = `
      <span class="material-symbols-outlined mr-2">login</span>
      Iniciar Sesión
    `;
  }

  /**
   * Maneja el submit del formulario de login
   */
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    hideError();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      showError('Por favor complete todos los campos');
      return;
    }

    disableSubmit();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Login exitoso - redirigir al dashboard
        window.location.href = '/dashboard';
      } else {
        // Error de autenticación
        showError(data.error || 'Error al iniciar sesión. Verifique sus credenciales.');
        enableSubmit();
      }
    } catch (error) {
      console.error('Error en login:', error);
      showError('Error de conexión. Por favor intente nuevamente.');
      enableSubmit();
    }
  });

  // Limpiar errores al escribir
  document.getElementById('username').addEventListener('input', hideError);
  document.getElementById('password').addEventListener('input', hideError);
});
