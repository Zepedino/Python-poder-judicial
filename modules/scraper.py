from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from .constants import CORTES_MAP, TRIBUNALES_MAP, COMPETENCIA_MAP
import os
import traceback

def perform_scraping(search_data: dict) -> str:
    """
    Scraping usando Browserless.io para compatibilidad con Vercel
    """
    browserless_token = os.getenv('BROWSERLESS_TOKEN')
    
    if not browserless_token:
        raise ValueError("BROWSERLESS_TOKEN no configurado en variables de entorno")
    
    # URL de conexión a Browserless
    ws_endpoint = f"wss://production-sfo.browserless.io?token={browserless_token}"
    
    browser = None
    context = None
    page = None
    
    try:
        print(f"[SCRAPER] Iniciando conexión a Browserless...")
        
        with sync_playwright() as p:
            # Conectar al navegador remoto de Browserless
            browser = p.chromium.connect_over_cdp(ws_endpoint)
            print("[SCRAPER] ✓ Conectado a Browserless")
            
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ignore_https_errors=True,
                viewport={'width': 1920, 'height': 1080}
            )
            page = context.new_page()
            page.set_default_timeout(60000)

            print("[SCRAPER] Configurando bloqueo de CSS/Imágenes/Fuentes...")
            def block_unnecessary_requests(route):
                if route.request.resource_type in ["stylesheet", "image", "font"]:
                    route.abort()
                else:
                    route.continue_()
            
            page.route("**/*", block_unnecessary_requests)
            
            # Navegar a la página
            url = 'https://oficinajudicialvirtual.pjud.cl/indexN.php'
            print(f"[SCRAPER] Navegando a: {url}")
            page.goto(url, wait_until='domcontentloaded')
            print("[SCRAPER] ✓ Página cargada")

            # Clic en "Consulta causas"
            consulta_button_selector = 'button.dropbtn[onclick*="accesoConsultaCausas"]'
            page.wait_for_selector(consulta_button_selector, timeout=30000)
            with page.expect_navigation(wait_until='domcontentloaded', timeout=30000):
                page.click(consulta_button_selector)
            print('[SCRAPER] ✓ Clic en "Consulta causas"')

            # Clic en pestaña "Búsqueda por Nombre"
            nombre_tab_selector = 'a[href="#BusNombre"]'
            page.wait_for_selector(nombre_tab_selector, timeout=30000)
            page.click(nombre_tab_selector)
            print('[SCRAPER] ✓ Pestaña "Búsqueda por Nombre"')

            # Obtener códigos de los mapeos
            codigo_corte = CORTES_MAP.get(search_data.get('corte'), '')
            codigo_tribunal = TRIBUNALES_MAP.get(search_data.get('tribunal'), '')
            codigo_competencia = COMPETENCIA_MAP.get(search_data.get('competencia'), '1')

            # Seleccionar competencia
            page.select_option('select#nomCompetencia', codigo_competencia)
            page.wait_for_timeout(500)
            print(f'[SCRAPER] ✓ Competencia: {search_data.get("competencia")}')

            # Si no es Corte Suprema, seleccionar corte y tribunal
            if search_data.get('competencia') != 'Corte Suprema':
                if codigo_corte:
                    with page.expect_response(lambda response: '/nomTribunal.php' in response.url, timeout=30000):
                        page.select_option('select#corteNom', codigo_corte)
                    print(f'[SCRAPER] ✓ Corte: {search_data.get("corte")}')
                
                if codigo_tribunal:
                    page.wait_for_selector(f'select#nomTribunal option[value="{codigo_tribunal}"]', timeout=30000)
                    page.select_option('select#nomTribunal', codigo_tribunal)
                    print(f'[SCRAPER] ✓ Tribunal: {search_data.get("tribunal")}')

            # Llenar formulario según tipo de persona
            if search_data.get('tipoPersona') == 'natural':
                page.click('input#radioPerNatural')
                page.fill('input#nomNombre', search_data.get('nombres', ''))
                page.fill('input#nomApePaterno', search_data.get('apellidoPaterno', '').strip())
                page.fill('input#nomApeMaterno', search_data.get('apellidoMaterno', '').strip())
                page.fill('input#nomEra', search_data.get('año'))
                print(f'[SCRAPER] ✓ Persona natural: {search_data.get("apellidoPaterno")} {search_data.get("nombres")}')
            else:
                page.click('input#radioPerJuridica')
                page.fill('input#nomNombreJur', search_data.get('nombrePersonaJuridica', ''))
                page.fill('input#nomEraJur', search_data.get('año'))
                print(f'[SCRAPER] ✓ Persona jurídica: {search_data.get("nombrePersonaJuridica")}')

            # Hacer clic en buscar
            page.click('button#btnConConsultaNom')
            print('[SCRAPER] ✓ Buscando...')
            
            # Esperar tabla de resultados
            tabla_resultados_selector = 'table#dtaTableDetalleNombre'
            page.wait_for_selector(tabla_resultados_selector, state='visible', timeout=45000)
            print('[SCRAPER] ✓ Tabla de resultados visible')

            # Contar filas
            rows = page.locator('tbody#verDetalleNombre tr')
            row_count = rows.count()

            if row_count <= 1:
                print('[SCRAPER] ⚠ No hay resultados')
                return None

            all_details_text = ""
            print(f"[SCRAPER] 📄 {row_count - 1} causa(s) encontrada(s)")

            # Procesar cada causa
            for i in range(row_count - 1):
                try:
                    row = rows.nth(i)
                    
                    # Extraer datos básicos
                    rol = row.locator('td').nth(1).inner_text()
                    tipo_recurso = row.locator('td').nth(2).inner_text()
                    caratulado = row.locator('td').nth(3).inner_text()
                    fecha_ingreso = row.locator('td').nth(4).inner_text()
                    estado_causa = row.locator('td').nth(5).inner_text()
                    corte = row.locator('td').nth(6).inner_text()

                    print(f"[SCRAPER] 📋 Causa {i + 1}: ROL {rol}")

                    causa_text = f"RESUMEN DE LA CAUSA\nROL: {rol}\nTipo Recurso: {tipo_recurso}\nCaratulado: {caratulado}\nFecha Ingreso: {fecha_ingreso}\nEstado Causa: {estado_causa}\nCorte: {corte}\n"

                    # Abrir modal
                    detail_link = row.locator('td:first-child a.toggle-modal')
                    onclick_command = detail_link.get_attribute('onclick')
                    
                    if not onclick_command:
                        print(f'[SCRAPER] ⚠ Sin onclick para {rol}')
                        continue
                    
                    page.evaluate(onclick_command)

                    # Esperar modal
                    modal_selector = '#modalDetalleSuprema'
                    page.wait_for_selector(modal_selector, state='visible', timeout=30000)
                    page.wait_for_timeout(2000)

                    # Extraer historial
                    modal_body_html = page.locator(f'{modal_selector} .modal-body').inner_html()
                    soup = BeautifulSoup(modal_body_html, 'html.parser')

                    causa_text += "\nHISTORIAL DE MOVIMIENTOS:\n"
                    
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
                    
                    print(f'[SCRAPER] ✓ {movimientos_count} movimientos')

                    all_details_text += f"\n\n═════════ Causa ROL: {rol} ═════════\n\n{causa_text}"

                    # Cerrar modal
                    close_modal_button_selector = f'{modal_selector} button[data-dismiss="modal"]'
                    page.click(close_modal_button_selector)
                    page.wait_for_selector(modal_selector, state='hidden', timeout=10000)
                    
                except Exception as e:
                    print(f'[SCRAPER] ⚠ Error en causa {i + 1}: {e}')
                    continue

            if all_details_text:
                print('[SCRAPER] ✅ Scraping completado')
                return all_details_text.strip()
            
            return None

    except Exception as e:
        print(f'[SCRAPER] ❌ Error: {e}')
        traceback.print_exc()
        
        # Intentar capturar screenshot para debug
        if page:
            try:
                screenshot_path = '/tmp/error_screenshot.png'
                page.screenshot(path=screenshot_path)
                print(f'[SCRAPER] 📸 Screenshot: {screenshot_path}')
            except:
                pass
        
        raise Exception(f"Error en scraping: {str(e)}")
    
    finally:
        try:
            if browser:
                browser.close()
                print('[SCRAPER] 🔌 Conexión cerrada')
        except:
            pass
