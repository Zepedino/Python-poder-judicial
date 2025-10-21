from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from .constants import CORTES_MAP, TRIBUNALES_MAP, COMPETENCIA_MAP
import os

def perform_scraping(search_data: dict) -> str:
    """
    Scraping usando Browserless.io para compatibilidad con Vercel
    """
    browserless_token = os.getenv('BROWSERLESS_TOKEN')
    
    if not browserless_token:
        raise ValueError("BROWSERLESS_TOKEN no configurado en variables de entorno")
    
    # URL de conexión a Browserless
    ws_endpoint = f"wss://chrome.browserless.io?token={browserless_token}"
    
    with sync_playwright() as p:
        try:
            # Conectar al navegador remoto de Browserless
            browser = p.chromium.connect_over_cdp(ws_endpoint)
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ignore_https_errors=True,
                viewport={'width': 1920, 'height': 1080}
            )
            page = context.new_page()
            page.set_default_timeout(60000)
            
            print("Conexión exitosa con Browserless")
            
            # Navegar a la página
            url = 'https://oficinajudicialvirtual.pjud.cl/indexN.php'
            page.goto(url, wait_until='domcontentloaded')
            print(f"Navegando a: {url}")

            # Clic en "Consulta causas"
            consulta_button_selector = 'button.dropbtn[onclick*="accesoConsultaCausas"]'
            page.wait_for_selector(consulta_button_selector, timeout=30000)
            with page.expect_navigation(wait_until='domcontentloaded', timeout=30000):
                page.click(consulta_button_selector)
            print('Clic en "Consulta causas"')

            # Clic en pestaña "Búsqueda por Nombre"
            nombre_tab_selector = 'a[href="#BusNombre"]'
            page.wait_for_selector(nombre_tab_selector, timeout=30000)
            page.click(nombre_tab_selector)
            print('Clic en la pestaña "Búsqueda por Nombre"')

            # Obtener códigos de los mapeos
            codigo_corte = CORTES_MAP.get(search_data.get('corte'), '')
            codigo_tribunal = TRIBUNALES_MAP.get(search_data.get('tribunal'), '')
            codigo_competencia = COMPETENCIA_MAP.get(search_data.get('competencia'), '1')

            # Seleccionar competencia
            page.select_option('select#nomCompetencia', codigo_competencia)
            page.wait_for_timeout(500)
            print(f'Competencia seleccionada: {search_data.get("competencia")}')

            # Si no es Corte Suprema, seleccionar corte y tribunal
            if search_data.get('competencia') != 'Corte Suprema':
                if codigo_corte:
                    with page.expect_response(lambda response: '/nomTribunal.php' in response.url, timeout=30000):
                        page.select_option('select#corteNom', codigo_corte)
                    print(f'Corte seleccionada: {search_data.get("corte")}')
                
                if codigo_tribunal:
                    page.wait_for_selector(f'select#nomTribunal option[value="{codigo_tribunal}"]', timeout=30000)
                    page.select_option('select#nomTribunal', codigo_tribunal)
                    print(f'Tribunal seleccionado: {search_data.get("tribunal")}')

            # Llenar formulario según tipo de persona
            if search_data.get('tipoPersona') == 'natural':
                page.click('input#radioPerNatural')
                page.fill('input#nomNombre', search_data.get('nombres', ''))
                page.fill('input#nomApePaterno', search_data.get('apellidoPaterno', '').strip())
                page.fill('input#nomApeMaterno', search_data.get('apellidoMaterno', '').strip())
                page.fill('input#nomEra', search_data.get('año'))
                print(f'Búsqueda por persona natural: {search_data.get("apellidoPaterno")} {search_data.get("apellidoMaterno")} {search_data.get("nombres")}')
            else:
                page.click('input#radioPerJuridica')
                page.fill('input#nomNombreJur', search_data.get('nombrePersonaJuridica', ''))
                page.fill('input#nomEraJur', search_data.get('año'))
                print(f'Búsqueda por persona jurídica: {search_data.get("nombrePersonaJuridica")}')

            # Hacer clic en buscar
            page.click('button#btnConConsultaNom')
            print('Clic en "Buscar". Esperando resultados...')
            
            # Esperar tabla de resultados
            tabla_resultados_selector = 'table#dtaTableDetalleNombre'
            page.wait_for_selector(tabla_resultados_selector, state='visible', timeout=45000)
            print('Tabla de resultados visible')

            # Contar filas
            rows = page.locator('tbody#verDetalleNombre tr')
            row_count = rows.count()

            if row_count <= 1:
                print('La búsqueda no arrojó resultados')
                return None

            all_details_text = ""
            print(f"Se encontraron {row_count - 1} causa(s)")

            # Procesar cada causa
            for i in range(row_count - 1):
                try:
                    row = rows.nth(i)
                    
                    # Extraer datos básicos de la fila
                    rol = row.locator('td').nth(1).inner_text()
                    tipo_recurso = row.locator('td').nth(2).inner_text()
                    caratulado = row.locator('td').nth(3).inner_text()
                    fecha_ingreso = row.locator('td').nth(4).inner_text()
                    estado_causa = row.locator('td').nth(5).inner_text()
                    corte = row.locator('td').nth(6).inner_text()

                    print(f"--- Procesando Causa #{i + 1}: ROL {rol} ---")

                    causa_text = f"RESUMEN DE LA CAUSA\nROL: {rol}\nTipo Recurso: {tipo_recurso}\nCaratulado: {caratulado}\nFecha Ingreso: {fecha_ingreso}\nEstado Causa: {estado_causa}\nCorte: {corte}\n"

                    # Abrir modal de detalles
                    detail_link = row.locator('td:first-child a.toggle-modal')
                    onclick_command = detail_link.get_attribute('onclick')
                    
                    if not onclick_command:
                        print(f'No se encontró onclick para causa {rol}. Saltando...')
                        continue
                    
                    page.evaluate(onclick_command)
                    print(f'Modal abierto para causa {rol}')

                    # Esperar modal
                    modal_selector = '#modalDetalleSuprema'
                    page.wait_for_selector(modal_selector, state='visible', timeout=30000)
                    page.wait_for_timeout(2000)

                    # Extraer HTML del modal
                    modal_body_html = page.locator(f'{modal_selector} .modal-body').inner_html()
                    soup = BeautifulSoup(modal_body_html, 'html.parser')

                    causa_text += "\nHISTORIAL DE MOVIMIENTOS:\n"
                    
                    # Extraer historial de movimientos
                    movimientos_count = 0
                    for tr in soup.select('#movimientosSup table tbody tr'):
                        celdas = tr.find_all('td')
                        if len(celdas) > 6:
                            fecha = celdas[4].get_text(strip=True)
                            tramite = celdas[5].get_text(strip=True)
                            desc_tramite = celdas[6].get_text(strip=True)
                            if fecha and tramite:
                                causa_text += f"- {fecha}: {tramite} - {desc_tramite}\n"
                                movimientos_count += 1
                    
                    print(f'Extraídos {movimientos_count} movimientos para causa {rol}')

                    all_details_text += f"\n\n═════════ Causa ROL: {rol} ═════════\n\n{causa_text}"

                    # Cerrar modal
                    close_modal_button_selector = f'{modal_selector} button[data-dismiss="modal"]'
                    page.click(close_modal_button_selector)
                    page.wait_for_selector(modal_selector, state='hidden', timeout=10000)
                    print(f'Modal cerrado para causa {rol}')
                    
                except Exception as e:
                    print(f'Error procesando causa #{i + 1}: {e}')
                    continue

            if all_details_text:
                print('✓ Scraping completado exitosamente')
                return all_details_text.strip()
            
            return None

        except Exception as e:
            print(f'Error durante el scraping: {e}')
            # Intentar tomar screenshot para debug
            try:
                screenshot_path = '/tmp/error_screenshot.png'
                page.screenshot(path=screenshot_path)
                print(f'Screenshot guardado en: {screenshot_path}')
            except:
                pass
            raise
        
        finally:
            try:
                browser.close()
                print('Conexión con Browserless cerrada')
            except:
                pass
