from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from .constants import CORTES_MAP, TRIBUNALES_MAP, COMPETENCIA_MAP
import os
import sys

def get_chromium_executable_path():
    """
    Finds a valid chromium executable path.
    1. First, it tries to find the one installed by @sparticuz/chromium.
    2. If not found, it falls back to the one installed by Playwright's own CLI.
    """
    # --- MÉTODO 1: Buscar el navegador de @sparticuz/chromium (para Vercel y local) ---
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        package_path = os.path.join(project_root, 'node_modules', '@sparticuz', 'chromium')
        executable_name = "chrome.exe" if sys.platform == "win32" else "chrome"

        if os.path.isdir(package_path):
            for root, dirs, files in os.walk(package_path):
                if executable_name in files:
                    found_path = os.path.join(root, executable_name)
                    print(f"Chromium de Sparticuz encontrado en: {found_path}")
                    return found_path
    except Exception as e:
        print(f"No se pudo buscar el Chromium de Sparticuz: {e}")

    # --- MÉTODO 2: Fallback al navegador de Playwright (para desarrollo local) ---
    print("No se encontró el Chromium de Sparticuz, intentando con el de Playwright...")
    try:
        # Esto requiere que hayas ejecutado 'playwright install' una vez
        from playwright.sync_api import sync_playwright
        
        # Ocultamos la salida de la consola de Playwright para que no sea confusa
        original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')
        
        with sync_playwright() as p:
            # Esta es la forma correcta de obtener la ruta del navegador por defecto
            path = p.chromium.executable_path
        
        # Restauramos la salida de la consola
        sys.stdout.close()
        sys.stdout = original_stdout
        
        if path and os.path.exists(path):
            print(f"Playwright Chromium encontrado en: {path}")
            return path
    except Exception as e:
        # Restauramos la salida de la consola en caso de error
        if not sys.stdout.closed:
            sys.stdout.close()
        sys.stdout = original_stdout
        print(f"No se pudo encontrar el Chromium de Playwright. Error: {e}")
        print("Asegúrate de haber ejecutado 'pip install playwright' y luego 'playwright install'")

    return None

def perform_scraping(search_data: dict) -> str:
    executable_path = get_chromium_executable_path()
    if not executable_path:
        error_msg = "Error: No se pudo encontrar un ejecutable de Chromium válido."
        print(error_msg)
        raise FileNotFoundError(error_msg)

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(executable_path=executable_path)
        except Exception as e:
            print(f"Error al lanzar el navegador: {e}")
            raise

        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            ignore_https_errors=True
        )
        page = context.new_page()
        page.set_default_timeout(60000)

        try:
            # ... (el resto de tu código de scraping no cambia) ...
            url = 'https://oficinajudicialvirtual.pjud.cl/indexN.php'
            page.goto(url, wait_until='domcontentloaded')
            print(f"Navegando a: {url}")

            consulta_button_selector = 'button.dropbtn[onclick*="accesoConsultaCausas"]'
            page.wait_for_selector(consulta_button_selector)
            with page.expect_navigation(wait_until='domcontentloaded'):
                page.click(consulta_button_selector)
            print('Clic en "Consulta causas".')

            nombre_tab_selector = 'a[href="#BusNombre"]'
            page.wait_for_selector(nombre_tab_selector)
            page.click(nombre_tab_selector)
            print('Clic en la pestaña "Búsqueda por Nombre".')

            codigo_corte = CORTES_MAP.get(search_data.get('corte'), '')
            codigo_tribunal = TRIBUNALES_MAP.get(search_data.get('tribunal'), '')
            codigo_competencia = COMPETENCIA_MAP.get(search_data.get('competencia'), '1')

            page.select_option('select#nomCompetencia', codigo_competencia)
            page.wait_for_timeout(500)

            if search_data.get('competencia') != 'Corte Suprema':
                if codigo_corte:
                    with page.expect_response(lambda response: '/nomTribunal.php' in response.url):
                        page.select_option('select#corteNom', codigo_corte)
                if codigo_tribunal:
                    page.wait_for_selector(f'select#nomTribunal option[value="{codigo_tribunal}"]')
                    page.select_option('select#nomTribunal', codigo_tribunal)

            if search_data.get('tipoPersona') == 'natural':
                page.click('input#radioPerNatural')
                page.fill('input#nomNombre', search_data.get('nombres', ''))
                page.fill('input#nomApePaterno', search_data.get('apellidoPaterno', '').strip())
                page.fill('input#nomApeMaterno', search_data.get('apellidoMaterno', '').strip())
                page.fill('input#nomEra', search_data.get('año'))
            else:
                page.click('input#radioPerJuridica')
                page.fill('input#nomNombreJur', search_data.get('nombrePersonaJuridica', ''))
                page.fill('input#nomEraJur', search_data.get('año'))

            page.click('button#btnConConsultaNom')
            print('Clic en "Buscar". Esperando resultados...')
            tabla_resultados_selector = 'table#dtaTableDetalleNombre'
            page.wait_for_selector(tabla_resultados_selector, state='visible')
            print('Tabla de resultados visible.')

            rows = page.locator('tbody#verDetalleNombre tr')
            row_count = rows.count()

            if row_count <= 1:
                print('La búsqueda no arrojó resultados.')
                return None

            all_details_text = ""
            print(f"Se procesarán {row_count - 1} causas.")

            for i in range(row_count - 1):
                row = rows.nth(i)
                
                rol = row.locator('td').nth(1).inner_text()
                tipo_recurso = row.locator('td').nth(2).inner_text()
                caratulado = row.locator('td').nth(3).inner_text()
                fecha_ingreso = row.locator('td').nth(4).inner_text()
                estado_causa = row.locator('td').nth(5).inner_text()
                corte = row.locator('td').nth(6).inner_text()

                print(f"--- Procesando Causa #{i + 1} (ROL: {rol}) ---")

                causa_text = f"RESUMEN DE LA CAUSA\nROL: {rol}\nTipo Recurso: {tipo_recurso}\nCaratulado: {caratulado}\nFecha Ingreso: {fecha_ingreso}\nEstado Causa: {estado_causa}\nCorte: {corte}\n"

                detail_link = row.locator('td:first-child a.toggle-modal')
                onclick_command = detail_link.get_attribute('onclick')
                if not onclick_command:
                    print('No se pudo encontrar el comando onclick. Saltando fila.')
                    continue
                
                page.evaluate(onclick_command)
                print('Comando JavaScript "onclick" ejecutado.')

                modal_selector = '#modalDetalleSuprema'
                page.wait_for_selector(modal_selector, state='visible')
                print('Modal de detalle abierto.')
                page.wait_for_timeout(2000)

                modal_body_html = page.locator(f'{modal_selector} .modal-body').inner_html()
                soup = BeautifulSoup(modal_body_html, 'html.parser')

                causa_text += "\nHISTORIAL DE MOVIMIENTOS:\n"
                
                for tr in soup.select('#movimientosSup table tbody tr'):
                    celdas = tr.find_all('td')
                    if len(celdas) > 6:
                        fecha = celdas[4].get_text(strip=True)
                        tramite = celdas[5].get_text(strip=True)
                        desc_tramite = celdas[6].get_text(strip=True)
                        if fecha and tramite:
                            causa_text += f"- {fecha}: {tramite} - {desc_tramite}\n"

                all_details_text += f"\n\n═════════ Causa ROL: {rol} ═════════\n\n{causa_text}"

                close_modal_button_selector = f'{modal_selector} button[data-dismiss="modal"]'
                page.click(close_modal_button_selector)
                page.wait_for_selector(modal_selector, state='hidden')
                print('Modal cerrado.')

            if all_details_text:
                print('¡ÉXITO DEFINITIVO! Todos los detalles fueron extraídos de forma unificada.')
                return all_details_text.strip()
            return None

        except Exception as e:
            print(f'Error durante el web scraping con Playwright: {e}')
            screenshot_path = '/tmp/error_screenshot.png' if 'VERCEL' in os.environ else 'error_screenshot.png'
            page.screenshot(path=screenshot_path)
            raise
        finally:
            browser.close()