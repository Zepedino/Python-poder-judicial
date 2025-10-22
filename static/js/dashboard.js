/**
 * Módulo de Dashboard - Justicia Clara
 * Maneja el panel de administración
 */

document.addEventListener('DOMContentLoaded', function() {
  const logoutButton = document.getElementById('logout-button');

  /**
   * Maneja el cierre de sesión
   */
  logoutButton.addEventListener('click', async function() {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirigir al login
        window.location.href = '/login';
      } else {
        console.error('Error al cerrar sesión');
        // Aún así redirigir al login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así redirigir al login
      window.location.href = '/login';
    }
  });

  /**
   * Carga las estadísticas del dashboard
   */
  async function loadDashboardStats() {
    try {
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          // No autorizado - redirigir al login
          window.location.href = '/login';
          return;
        }
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();
      
      // Aquí puedes actualizar las estadísticas en tiempo real si lo deseas
      console.log('Estadísticas cargadas:', data);
      
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  // Cargar estadísticas al inicio
  loadDashboardStats();

  // Actualizar estadísticas cada 30 segundos
  setInterval(loadDashboardStats, 30000);

  /**
   * Animación de las tarjetas de estadísticas
   */
  function animateStats() {
    const statCards = document.querySelectorAll('.bg-white.dark\\:bg-zinc-800');
    
    statCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease-out';
        
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 50);
      }, index * 100);
    });
  }

  // Ejecutar animación al cargar
  animateStats();
});
