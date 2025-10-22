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
  
  // =====================================================
  // CONSTANTES COMPLETAS - Sincronizadas con constants.py
  // =====================================================
  
  // Mapeo de Cortes de Apelaciones
  const CORTES_MAP = {
    'C.A. de Arica': '10',
    'C.A. de Iquique': '11',
    'C.A. de Antofagasta': '15',
    'C.A. de Copiapó': '20',
    'C.A. de La Serena': '25',
    'C.A. de Valparaíso': '30',
    'C.A. de Rancagua': '35',
    'C.A. de Talca': '40',
    'C.A. de Chillán': '45',
    'C.A. de Concepción': '46',
    'C.A. de Temuco': '50',
    'C.A. de Valdivia': '55',
    'C.A. de Puerto Montt': '56',
    'C.A. de Coyhaique': '60',
    'C.A. de Punta Arenas': '61',
    'C.A. de Santiago': '90',
    'C.A. de San Miguel': '91'
  };
  
  // Mapeo de Tribunales CIVIL
  const TRIBUNALES_MAP_CIVIL = {
    '1º Juzgado de Letras de Arica': '2',
    '1º Juzgado De Letras de Arica ex 4°': '1400',
    '2º Juzgado de Letras de Arica': '3',
    '2º Juzgado De Letras de Arica ex 4°': '1401',
    '3º Juzgado de Letras de Arica': '4',
    '3º Juzgado de Letras de Arica Ex 4º': '5',
    'Juzgado de Letras y Gar. Pozo Almonte': '6',
    '1º Juzgado de Letras de Iquique': '9',
    '2º Juzgado de Letras de Iquique': '10',
    '3º Juzgado de Letras de Iquique': '11',
    'Juzgado de Letras Tocopilla': '13',
    'Juzgado de Letras y Gar.de María Elena': '14',
    '1º Juzgado de Letras de Calama': '16',
    '2º Juzgado de Letras de Calama': '17',
    '3º Juzgado de Letras de Calama': '658',
    'Juzgado de Letras y Gar. de Taltal': '26',
    '1º Juzgado de Letras Civil de Antofagasta': '1041',
    '2º Juzgado de Letras Civil de Antofagasta': '1042',
    '3º Juzgado de Letras Civil de Antofagasta': '1043',
    '4 ° Juzgado de Letras Civil de Antofagasta': '1044',
    'Juzgado de Letras y Garantía Mejillones': '1501',
    'Juzgado de Letras y Gar. de Chañaral': '27',
    'Juzgado de Letras de Diego de Almagro': '29',
    '1º Juzgado de Letras de Copiapó': '31',
    '2º Juzgado de Letras de Copiapó': '32',
    '3º Juzgado de Letras de Copiapó': '33',
    'Juzgado de Letras y Gar.de Freirina': '34',
    '4º Juzgado de Letras de Copiapó': '926',
    '1º Juzgado de Letras de Vallenar': '36',
    '2º Juzgado de Letras de Vallenar': '37',
    'Juzgado de Letras y Gar.de Caldera': '386',
    '1º Juzgado de Letras de la Serena': '40',
    '2º Juzgado de Letras de la Serena': '41',
    '3º Juzgado de Letras de la Serena': '42',
    '1º Juzgado de Letras de Coquimbo': '43',
    '2º Juzgado de Letras de Coquimbo': '44',
    '3º Juzgado de Letras de Coquimbo': '45',
    'Juzgado de Letras de Vicuña': '46',
    'Juzgado de letras y garantía de Andacollo': '47',
    '1º Juzgado de Letras de Ovalle': '48',
    '2º Juzgado de Letras de Ovalle': '49',
    '3º Juzgado de Letras de Ovalle': '50',
    'Juzgado de Letras y Gar.de Combarbalá': '51',
    'Juzgado de Letras de Illapel': '52',
    'Juzgado de Letras y Gar. de los Vilos': '53',
    '1º Juzgado Civil de Valparaíso': '56',
    '2º Juzgado Civil de Valparaíso': '55',
    '3º Juzgado Civil de Valparaíso': '54',
    '4º Juzgado Civil de Valparaíso': '59',
    '5º Juzgado Civil de Valparaíso': '60',
    '1º Juzgado Civil de Viña del Mar': '57',
    '2º Juzgado Civil de Viña del Mar': '58',
    '3º Juzgado Civil de Viña del Mar': '61',
    '1º Juzgado de Letras de Quilpue': '83',
    '2º Juzgado de Letras de Quilpue': '84',
    'Juzgado de Letras de Villa Alemana': '85',
    'Juzgado de Letras de Casablanca': '86',
    'Juzgado de Letras de La Ligua': '87',
    'Juzgado de Letras y Gar. de Petorca': '88',
    '1º Juzgado de Letras de Los Andes': '89',
    '2º Juzgado de Letras de Los Andes': '90',
    '1º Juzgado de Letras de San Felipe': '92',
    '1º Juzgado de Letras de San Felipe Ex 2º': '93',
    'Juzgado de Letras y Gar.de Putaendo': '94',
    '1º Juzgado de Letras de Quillota': '96',
    '2º Juzgado de Letras de Quillota': '97',
    'Juzgado de Letras de La Calera': '98',
    'Juzgado de Letras de Limache': '99',
    '1º Juzgado de Letras de San Antonio': '101',
    '2º Juzgado de Letras de San Antonio': '102',
    'Juzgado de Letras y Gar. de Isla de Pascua': '103',
    'Juzgado de Letras y Gar.de Quintero': '660',
    '1º Juzgado Civil de Rancagua': '110',
    '2º Juzgado Civil de Rancagua': '969',
    '1º Juzgado de Letras de Rengo': '111',
    'Juzgado de Letras de San Vicente de Tagua Tagua': '113',
    '1º Juzgado de Letras y Gar.de Peumo': '114',
    '1º Juzgado de Letras de San Fernando': '115',
    '2º Juzgado de Letras de San Fernando': '116',
    '1º Juzgado de Letras de Santa Cruz': '117',
    '1º Juzgado De Letras De Santa Cruz Ex 2°': '118',
    'Juzgado de Letras y Gar.de Pichilemu': '119',
    'Juzgado de Letras y Gar.de Litueche': '1150',
    'Juzgado de Letras y Gar.de Peralillo': '1151',
    '1º Juzgado de Letras de Talca': '122',
    '2º Juzgado de Letras de Talca': '123',
    '3º Juzgado de Letras de Talca': '124',
    '4º Juzgado de Letras de Talca': '125',
    'Juzgado de Letras de Constitución': '126',
    'Juzgado De Letras Y Gar. de Curepto': '127',
    '1º Juzgado de Letras de Curicó': '129',
    '2º Juzgado de Letras de Curicó': '130',
    '2º Juzgado de Letras de Curicó Ex 3°': '131',
    'Juzgado De Letras Y Gar. de Licantén': '132',
    'Juzgado de Letras de Molina': '133',
    '1º Juzgado de Letras de Linares': '135',
    '2º Juzgado de Letras de Linares': '136',
    'Juzgado de Letras de San Javier': '138',
    'Juzgado de Letras de Cauquenes': '139',
    'Juzgado de Letras y Gar. de Chanco': '140',
    'Juzgado de Letras de Parral': '141',
    '1º Juzgado Civil de Chillán': '145',
    '2º Juzgado Civil de Chillán': '146',
    '1º Juzgado de Letras de San Carlos': '147',
    'Juzgado de Letras de Yungay': '149',
    'Juzgado de Letras y Gar. de Bulnes': '150',
    'Juzgado de Letras y Gar.de Coelemu': '151',
    'Juzgado de Letras y Gar.de Quirihue': '152',
    '1º Juzgado de Letras de Los Angeles': '154',
    '2º Juzgado de Letras de Los Angeles': '155',
    '2° Juzgado de Letras de Los Angeles ex 3°': '156',
    'Juzgado de Letras y Gar. de Mulchen': '157',
    'Juzgado de Letras y Gar.de Nacimiento': '158',
    'Juzgado de Letras y Gar.de Laja': '159',
    'Juzgado de Letras y Gar.de Yumbel': '160',
    '1º Juzgado Civil de Concepción': '161',
    '2º Juzgado Civil de Concepción': '162',
    '3º Juzgado Civil de Concepción': '163',
    '1º Juzgado Civil de Talcahuano': '179',
    '2º Juzgado Civil de Talcahuano': '180',
    'Juzgado de Letras de Tomé': '187',
    'Juzgado de Letras y Gar.de Florida': '188',
    'Juzgado de Letras y Gar.de Santa Juana': '189',
    'Juzgado de Letras y Gar. de Lota': '190',
    '1º Juzgado de Letras de Coronel': '191',
    '2º Juzgado de Letras de Coronel': '192',
    'Juzgado de Letras y Gar.de Lebu': '193',
    'Juzgado de Letras de Arauco': '194',
    'Juzgado de Letras y Gar.de Curanilahue': '195',
    'Juzgado de Letras de Cañete': '196',
    'Juzgado de Letras y Gar. Santa Bárbara': '385',
    'Juzgado de Letras y Gar.de Cabrero': '1152',
    '1º Juzgado Civil de Temuco': '197',
    '2º Juzgado Civil de Temuco': '198',
    'Juzgado de Letras de Angol': '204',
    'Juzgado de Letras y Gar.de Collipulli': '206',
    'Juzgado de Letras y Gar.de Traiguén': '207',
    'Juzgado de Letras de Victoria': '208',
    'Juzgado de Letras y Gar.de Curacautin': '209',
    'Juzgado de Letras Loncoche': '210',
    'Juzgado de Letras de Pitrufquen': '211',
    'Juzgado de Letras de Villarrica': '212',
    'Juzgado de Letras de Nueva Imperial': '213',
    'Juzgado de Letras y Gar.de Pucón': '214',
    'Juzgado de Letras de Lautaro': '215',
    'Juzgado de Letras y Gar.de Carahue': '216',
    '3º Juzgado Civil de Temuco': '406',
    'Juzgado de Letras y Gar.de Tolten': '946',
    'Juzgado de Letras y Gar.de Puren': '947',
    '1º Juzgado Civil de Valdivia': '220',
    '2º Juzgado Civil de Valdivia': '221',
    'Juzgado de Letras de Mariquina': '222',
    'Juzgado de Letras y Gar.de Paillaco': '223',
    'Juzgado de Letras Los Lagos': '224',
    'Juzgado de Letras y Gar. de Panguipulli': '225',
    'Juzgado de Letras y Gar.de la Unión': '226',
    'Juzgado de Letras y Gar.de Río Bueno': '227',
    '1º Juzgado de Letras de Osorno': '229',
    '2º Juzgado de Letras de Osorno': '230',
    'Juzgado de Letras de Rio Negro': '233',
    '1º Juzgado Civil de Puerto Montt': '237',
    '2º Juzgado Civil de Puerto Montt': '1012',
    'Juzgado de Letras de Puerto Varas': '238',
    'Juzgado de Letras y Gar.de Calbuco': '240',
    'Juzgado de Letras y Gar. de Maullin': '241',
    'Juzgado de Letras de Castro': '242',
    'Juzgado de Letras de Ancud': '243',
    'Juzgado de Letras y Garantía de Achao': '244',
    'Juzgado de Letras y Gar. de Chaitén': '245',
    'Juzgado de Letras y Gar. de Los Muermos': '659',
    'Juzgado de Letras y Gar. de Quellón': '662',
    'Juzgado de Letras y Gar. de Hualaihue': '1013',
    '1º Juzgado de Letras de Coyhaique': '246',
    '1º Juzgado de Letras de Coyhaique Ex 2º': '247',
    'Juzgado de Letras y Gar.de pto.Aysen': '248',
    'Juzgado de Letras y Gar.de Chile Chico': '249',
    'Juzgado de Letras y Gar.de Cochrane': '250',
    'Juzgado de Letras y Gar.de Puerto Cisnes': '996',
    '1º Juzgado de Letras de Punta Arenas': '253',
    '2º Juzgado de Letras de Punta Arenas': '254',
    '3º Juzgado de Letras de Punta Arenas': '255',
    'Juzgado de Letras y Gar. de Puerto Natales': '257',
    'Juzgado de Letras y Gar.de Porvenir': '258',
    'Juzgado de Letras y Garantía de Cabo de Hornos': '1502',
    '1º Juzgado Civil de Santiago': '259',
    '2º Juzgado Civil de Santiago': '260',
    '3º Juzgado Civil de Santiago': '261',
    '4º Juzgado Civil de Santiago': '262',
    '5º Juzgado Civil de Santiago': '263',
    '6º Juzgado Civil de Santiago': '264',
    '7º Juzgado Civil de Santiago': '265',
    '8º Juzgado Civil de Santiago': '266',
    '9º Juzgado Civil de Santiago': '267',
    '10º Juzgado Civil de Santiago': '268',
    '11º Juzgado Civil de Santiago': '269',
    '12º Juzgado Civil de Santiago': '270',
    '13º Juzgado Civil de Santiago': '271',
    '14º Juzgado Civil de Santiago': '272',
    '15º Juzgado Civil de Santiago': '273',
    '16º Juzgado Civil de Santiago': '274',
    '17º Juzgado Civil de Santiago': '275',
    '18º Juzgado Civil de Santiago': '276',
    '19º Juzgado Civil de Santiago': '277',
    '20º Juzgado Civil de Santiago': '278',
    '21º Juzgado Civil de Santiago': '279',
    '22º Juzgado Civil de Santiago': '280',
    '23º Juzgado Civil de Santiago': '281',
    '24º Juzgado Civil de Santiago': '282',
    '25º Juzgado Civil de Santiago': '283',
    '26º Juzgado Civil de Santiago': '284',
    '27º Juzgado Civil de Santiago': '285',
    '28º Juzgado Civil de Santiago': '286',
    '29º Juzgado Civil de Santiago': '287',
    '30º Juzgado Civil de Santiago': '288',
    'Juzgado de Letras de Colina': '387',
    '1º Juzgado Civil de San Miguel': '343',
    '2º Juzgado Civil de San Miguel': '344',
    '3º Juzgado Civil de San Miguel': '345',
    '4º Juzgado Civil de San Miguel': '390',
    '1º Juzgado Civil de Puente Alto': '364',
    '1º Juzgado De Letras De Talagante': '373',
    '2º Juzgado De Letras De Talagante': '374',
    '1º Juzgado de Letras de Melipilla': '375',
    '1º Juzgado de Letras de Buin': '377',
    '2º Juzgado de Letras de Buin': '378',
    'Juzgado de Letras de Peñaflor': '388',
    '1º Juzgado de Letras de San Bernardo': '400',
    '1º Juzgado de Letras de San Bernardo Ex 3°': '1402',
    '2º Juzgado de Letras de San Bernardo': '401',
    '2º Juzgado de Letras de San Bernardo Ex 3°': '1403'
  };

  // Mapeo de Tribunales LABORAL
  const TRIBUNALES_MAP_LABORAL = {
    'Juzgado de Letras y Garantía de Pozo Almonte': '6',
    'Juzgado de Letras y Garantía de María Elena': '14',
    'Juzgado de Letras y Garantía de Taltal': '26',
    'Juzgado de Letras y Garantia de Chañaral': '27',
    'Juzgado de Letras de Diego de Almagro': '29',
    'Juzgado de Letras y Garantía de Freirina': '34',
    '1° Juzgado de Letras de Vallenar': '36',
    '2° Juzgado de Letras de Vallenar': '37',
    'Juzgado de Letras de Vicuña': '46',
    'Juzgado de Letras y Garantía de Andacollo': '47',
    '1º Juzgado de Letras de Ovalle': '48',
    '2º Juzgado de Letras de Ovalle': '49',
    '3° Juzgado de Letras de Ovalle': '50',
    'Juzgado de Letras y Garantía de Combarbalá': '51',
    'Juzgado de Letras de Illapel': '52',
    'Juzgado de Letras y Garantía de los Vilos': '53',
    '1º Juzgado de Letras de Quilpue': '83',
    '2º Juzgado de Letras de Quilpue': '84',
    'Juzgado de Letras de Villa Alemana': '85',
    'Juzgado de Letras de Casablanca': '86',
    'Juzgado de Letras de La Ligua': '87',
    'Juzgado de Letras y Garantía de Petorca': '88',
    '1º Juzgado de Letras de Los Andes': '89',
    '2º Juzgado de Letras de Los Andes': '90',
    'Juzgado de Letras y Garantía de Putaendo': '94',
    '1º Juzgado de Letras de Quillota': '96',
    '2º Juzgado de Letras de Quillota': '97',
    'Juzgado de Letras de La Calera': '98',
    'Juzgado de Letras de Limache': '99',
    '1° Juzgado de Letras de San Antonio': '101',
    '2° Juzgado de Letras de San Antonio': '102',
    '1º Juzgado de Letras de Rengo': '111',
    'Juzgado de Letras de San Vicente': '113',
    '1º Juzgado de Letras y Garantia de Peumo': '114',
    '1º Juzgado de Letras de San Fernando': '115',
    '2º Juzgado de Letras de San Fernando': '116',
    '1º Juzgado de Letras de Santa Cruz': '117',
    'Juzgado de Letras y Garantia de Pichilemu': '119',
    'Juzgado de Letras de Constitución': '126',
    'Juzgado de Letras y Garantía de Curepto': '127',
    'Juzgado de Letras y Garantía de Licantén': '132',
    'Juzgado de Letras de Molina': '133',
    '1° Juzgado de Letras de Linares': '135',
    '2° Juzgado de Letras de Linares': '136',
    'Juzgado de Letras de San Javier': '138',
    'Juzgado de Letras de Cauquenes': '139',
    'Juzgado de Letras y Garantía de Chanco': '140',
    'Juzgado de Letras de Parral': '141',
    '1° Juzgado de Letras de San Carlos': '147',
    'Juzgado de Letras de Yungay': '149',
    'Juzgado de Letras y Garantía de Bulnes': '150',
    'Juzgado de Letras y Garantía de Coelemu': '151',
    'Juzgado de Letras y Garantía de Quirihue': '152',
    'Juzgado de Letras y Garantía de Mulchén': '157',
    'Juzgado de Letras y Garantía de Nacimiento': '158',
    'Juzgado de Letras y Garantía de Laja': '159',
    'Juzgado de Letras y Garantía de Yumbel': '160',
    'Juzgado de Letras de Tomé': '187',
    'Juzgado de Letras y Garantía de Florida': '188',
    'Juzgado de Letras y Garantía de Santa Juana': '189',
    'Juzgado de Letras y Garantía de Lota': '190',
    '1er Juzgado de Letras de Coronel': '191',
    '2do Juzgado de Letras de Coronel': '192',
    'Juzgado de Letras y Garantía de Lebu': '193',
    'Juzgado de Letras de Arauco': '194',
    'Juzgado de Letras y Garantía de Curanilahue': '195',
    'Juzgado de Letras de Cañete': '196',
    '1º Juzgado de Letras de Angol': '204',
    'Juzgado de Letras y Garantía de Collipulli': '206',
    'Juzgado de Letras y Garantía de Traiguen': '207',
    'Juzgado de Letras de Victoria': '208',
    'Juzgado de Letras y Garantía de Curacautín': '209',
    'Juzgado de Letras de Villarrica': '212',
    'Juzgado de Letras de Nueva Imperial': '213',
    'Juzgado de Letras y Garantía de Pucón': '214',
    'Juzgado de Letras de Lautaro': '215',
    'Juzgado de Letras y Garantía de Carahue': '216',
    'Juzgado de Letras de Mariquina': '222',
    'Juzgado de Letras y Garantía de Paillaco': '223',
    'Juzgado de Letras y Garantía de Panguipulli': '225',
    'Juzgado de Letras y Garantía de La Unión': '226',
    'Juzgado de Letras y Garantía de Río Bueno': '227',
    '1º Juzgado de Letras de Puerto Varas': '238',
    'Juzgado de Letras y Garantía de Calbuco': '240',
    'Juzgado de Letras y Garantía de Maullín': '241',
    'Juzgado de Letras de Ancud': '243',
    'Juzgado de Letras y Garantía de Achao': '244',
    'Juzgado de Letras y Garantía de Chaitén': '245',
    'Juzgado de Letras y Garantía de Aysén': '248',
    'Juzgado de Letras y Garantía de Chile Chico': '249',
    'Juzgado de Letras y Garantía de Cochrane': '250',
    'Juzgado de Letras y Garantía de Puerto Natales': '257',
    'Juzgado de Letras y Garantía de Porvenir': '258',
    '1° Juzgado de Letras de Talagante': '373',
    '2do Juzgado de Letras de Talagante': '374',
    '1er Juzgado de Letras de Melipilla': '375',
    '1er Juzgado de Letras de Buin': '377',
    '2do Juzgado de Letras de Buin': '378',
    'Juzgado de Letras y Garantía de Caldera': '386',
    'Juzgado de Letras de Colina': '387',
    'Juzgado de Letras de Peñaflor': '388',
    'Juzgado de Letras y Garantía de Toltén': '946',
    'Juzgado de Letras y Garantía de Purén': '947',
    'Juzgado de Letras del Trabajo de Arica': '1333',
    'Juzgado de Letras del Trabajo de Iquique': '1334',
    'Juzgado de Letras del Trabajo de Antofagasta': '1335',
    'Juzgado de Letras del Trabajo de Copiapó': '1336',
    'Juzgado de Letras del Trabajo de La Serena': '1337',
    'Juzgado de Letras del Trabajo de Valparaíso': '1338',
    'Juzgado de Letras del Trabajo de Rancagua': '1339',
    'Juzgado de Letras del Trabajo de Curicó': '1340',
    'Juzgado de Letras del Trabajo de Talca': '1341',
    'Juzgado de Letras del Trabajo de Chillán': '1342',
    'Juzgado de Letras del Trabajo de Concepción': '1343',
    'Juzgado de Letras del Trabajo de Temuco': '1344',
    'Juzgado de Letras del Trabajo de Valdivia': '1345',
    'Juzgado de Letras del Trabajo de Puerto Montt': '1346',
    'Juzgado de Letras del Trabajo de Punta Arenas': '1347',
    '1º Juzgado de Letras del Trabajo de Santiago': '1348',
    '2º Juzgado de Letras del Trabajo de Santiago': '1349',
    'Juzgado de Letras del Trabajo de San Miguel': '1351',
    'Juzgado de Letras del Trabajo de San Bernardo': '1352',
    'Juzgado de Letras del Trabajo de Calama': '1357',
    'Juzgado de Letras del Trabajo de San Felipe': '1358',
    'Juzgado de Letras del Trabajo de Los Angeles': '1359',
    'Juzgado de Letras del Trabajo de Osorno': '1360',
    'Juzgado de Letras del Trabajo de Castro': '1361',
    'Juzgado de Letras del Trabajo de Coyhaique': '1362',
    'Juzgado de Letras del Trabajo de Puente Alto': '1363',
    'Juzgado de Letras y Garantía de Alto Hospicio': '1500',
    'Juzgado de Letras de Mejillones': '1501',
    'Juzgado de Letras de Cabo de Hornos': '1502',
    'Portal': '9003',
    'Juzgado de Prueba 4º': '9005',
    'Juzgado de Prueba 5°': '9006'
  };

  // Mapeo de Tribunales PENAL
  const TRIBUNALES_MAP_PENAL = {
    'Juzgado De Letras Y Garantía De Pozo Almonte.': '6',
    'Juzgado De Letras Y Garantía De María Elena.': '14',
    'Juzgado De Letras Y Garantía De Taltal.': '26',
    'Juzgado De Letras Y Garantía De Chañaral.': '27',
    'Juzgado De Letras Y Garantía De Freirina.': '34',
    'Juzgado De Letras Y Garantía De Andacollo.': '47',
    'Juzgado De Letras Y Garantía De Combarbala.': '51',
    'Juzgado De Letras Y Garantía De Los Vilos.': '53',
    'Juzgado De Letras Y Garantía De Petorca.': '88',
    'Juzgado De Letras Y Garantía De Putaendo.': '94',
    'Juzgado De Letras Y Garantía De Isla De Pascua.': '103',
    '1º Juzgado De Letras Y Garantía De Peumo.': '114',
    'Juzgado De Letras Y Garantía De Pichilemu.': '119',
    'Juzgado De Letras Y Garantía De Curepto.': '127',
    'Juzgado De Letras Y Garantía De Licanten.': '132',
    'Juzgado De Letras Y Garantía De Chanco.': '140',
    'Juzgado De Letras Y Garantía De Bulnes.': '150',
    'Juzgado De Letras Y Garantía De Coelemu.': '151',
    'Juzgado De Letras Y Garantía De Quirihue.': '152',
    'Juzgado De Letras Y Garantía De Mulchen.': '157',
    'Juzgado De Letras Y Garantía De Nacimiento.': '158',
    'Juzgado De Letras Y Garantía De Laja.': '159',
    'Juzgado De Letras Y Garantía De Yumbel.': '160',
    'Juzgado De Letras Y Garantía De Florida.': '188',
    'Juzgado De Letras Y Garantía De Santa Juana.': '189',
    'Juzgado De Letras Y Garantía De Lota.': '190',
    'Juzgado De Letras Y Garantía De Lebu.': '193',
    'Juzgado De Letras Y Garantía De Curanilahue.': '195',
    'Juzgado De Letras Y Garantía De Collipulli.': '206',
    'Juzgado De Letras Y Garantía De Traiguen.': '207',
    'Juzgado De Letras Y Garantía De Curacautin.': '209',
    'Juzgado De Letras Y Garantía De Pucon.': '214',
    'Juzgado De Letras Y Garantía De Carahue.': '216',
    'Juzgado De Letras Y Garantía De Paillaco.': '223',
    'Juzgado De Letras Y Garantía De Panguipulli.': '225',
    'Juzgado De Letras Y Garantia De La Union.': '226',
    'Juzgado De Letras Y Garantía De Río Bueno.': '227',
    'Juzgado De Letras Y Garantía De Calbuco.': '240',
    'Juzgado De Letras Y Garantía De Maullin.': '241',
    'Juzgado De Letras Y Garantía De Achao.': '244',
    'Juzgado De Letras Y Garantía De Chaiten.': '245',
    'Juzgado De Letras Y Garantía De Puerto Aysen.': '248',
    'Juzgado De Letras Y Garantía De Chile Chico.': '249',
    'Juzgado De Letras Y Garantía De Cochrane.': '250',
    'Juzgado De Letras Y Garantía De Puerto Natales.': '257',
    'Juzgado De Letras Y Garantía De Porvenir.': '258',
    'Juzgado De Letras Y Garantía De Santa Barbara.': '385',
    'Juzgado De Letras Y Garantía De Caldera.': '386',
    'Juzgado De Letras Y Garantía De Los Muermos.': '659',
    'Juzgado De Letras Y Garantía De Quintero.': '660',
    'Juzgado De Letras Y Garantía De Quellon.': '662',
    'Tribunal De Juicio Oral En Lo Penal De La Serena.': '927',
    'Tribunal De Juicio Oral En Lo Penal De Ovalle.': '928',
    'Juzgado De Garantía De La Serena.': '929',
    'Juzgado De Garantía De Coquimbo.': '930',
    'Juzgado De Garantía De Vicuña.': '931',
    'Juzgado De Garantía De Ovalle.': '932',
    'Juzgado De Garantía De Illapel.': '933',
    'Tribunal De Juicio Oral En Lo Penal De Temuco.': '934',
    'Tribunal De Juicio Oral En Lo Penal De Angol.': '935',
    'Tribunal De Juicio Oral En Lo Penal De Villarrica.': '936',
    'Juzgado De Garantía De Temuco.': '937',
    'Juzgado De Garantía De Pitrufquen.': '938',
    'Juzgado De Garantía De Villarrica.': '939',
    'Juzgado De Garantía De Angol.': '940',
    'Juzgado De Garantía De Victoria.': '941',
    'Juzgado De Garantía De Nueva Imperial.': '942',
    'Juzgado De Garantía De Lautaro.': '943',
    'Juzgado De Garantía De Loncoche.': '944',
    'Juzgado De Letras Y Garantía De Tolten.': '946',
    'Juzgado De Letras Y Garantía De Puren.': '947',
    'Tribunal De Juicio Oral En Lo Penal De Calama.': '948',
    'Tribunal De Juicio Oral En Lo Penal De Antofagasta.': '949',
    'Juzgado De Garantía De Tocopilla.': '950',
    'Juzgado De Garantía De Calama.': '951',
    'Juzgado De Garantía De Antofagasta.': '952',
    'Tribunal De Juicio Oral En Lo Penal De Copiapo.': '953',
    'Juzgado De Garantía De Diego De Almagro.': '954',
    'Juzgado De Garantía De Copiapo.': '955',
    'Juzgado De Garantía De Vallenar.': '956',
    'Tribunal De Juicio Oral En Lo Penal De Curico.': '957',
    'Tribunal De Juicio Oral En Lo Penal De Talca.': '958',
    'Tribunal De Juicio Oral En Lo Penal De Linares.': '959',
    'Tribunal De Juicio Oral En Lo Penal De Cauquenes.': '960',
    'Juzgado De Garantía De Curico.': '961',
    'Juzgado De Garantía De Molina.': '962',
    'Juzgado De Garantía De Constitución.': '963',
    'Juzgado De Garantía De Talca.': '964',
    'Juzgado De Garantía De San Javier.': '965',
    'Juzgado De Garantía De Cauquenes.': '966',
    'Juzgado De Garantía De Linares.': '967',
    'Juzgado De Garantía De Parral.': '968',
    'Tribunal De Juicio Oral En Lo Penal De Arica.': '988',
    'Tribunal De Juicio Oral En Lo Penal De Iquique.': '989',
    'Tribunal De Juicio Oral En Lo Penal De Coyhaique.': '990',
    'Tribunal De Juicio Oral En Lo Penal Punta Arenas.': '991',
    'Juzgado De Garantía De Arica.': '992',
    'Juzgado De Garantía De Iquique.': '993',
    'Juzgado De Garantía De Coyhaique.': '994',
    'Juzgado De Garantía De Punta Arenas.': '995',
    'Juzgado De Letras Y Garantía De Cisnes.': '996',
    'Juzgado De Garantía De Valparaíso.': '1045',
    'Juzgado De Garantia De Viña Del Mar.': '1046',
    'Juzgado De Garantía De Quilpué.': '1047',
    'Tribunal De Juicio Oral En Lo Penal Viña Del Mar.': '1048',
    'Juzgado De Garantía De San Antonio.': '1049',
    'Juzgado De Garantía De Casablanca.': '1050',
    'Juzgado De Garantía De La Ligua.': '1051',
    'Juzgado De Garantía De San Felipe.': '1052',
    'Tribunal De Juicio Oral En Lo Penal De Quillota.': '1053',
    'Tribunal De Juicio Oral En Lo Penal De Valparaíso.': '1054',
    'Juzgado De Garantía De Limache.': '1055',
    'Juzgado De Garantía De La Calera.': '1056',
    'Juzgado De Garantía De Quillota.': '1057',
    'Tribunal De Juicio Oral En Lo Penal De Los Andes.': '1058',
    'Tribunal De Juicio Oral En Lo Penal De San Felipe.': '1059',
    'Juzgado De Garantía De Los Andes.': '1060',
    'Juzgado De Garantía De Villa Alemana.': '1061',
    'Tribunal De Juicio Oral En Lo Penal San Antonio.': '1062',
    'Juzgado De Garantía De San Fernando.': '1063',
    'Tribunal De Juicio Oral En Lo Penal De Santa Cruz.': '1064',
    'Juzgado De Garantía De Santa Cruz.': '1065',
    'Juzgado De Garantía De Rengo.': '1067',
    'Tribunal De Juicio Oral En Lo Penal San Fernando.': '1068',
    'Juzgado De Garantía De Graneros.': '1069',
    'Juzgado De Garantía De Rancagua.': '1070',
    'Tribunal De Juicio Oral En Lo Penal De Rancagua.': '1071',
    'Juzgado De Garantía De Chillán.': '1072',
    'Juzgado De Garantía De Yungay.': '1073',
    'Juzgado De Garantía De San Carlos.': '1074',
    'Juzgado De Garantía De San Pedro De La Paz.': '1075',
    'Juzgado De Garantía De Cañete.': '1076',
    'Juzgado De Garantía De Arauco.': '1077',
    'Juzgado De Garantía De Coronel.': '1078',
    'Juzgado De Garantía De Tomé.': '1079',
    'Juzgado De Garantía De Talcahuano.': '1080',
    'Juzgado De Garantía De Chiguayante.': '1081',
    'Juzgado De Garantía De Concepción.': '1082',
    'Juzgado De Garantía De Los Angeles.': '1083',
    'Juzgado De Garantía De Valdivia.': '1084',
    'Juzgado De Garantía De Mariquina.': '1085',
    'Juzgado De Garantía De Los Lagos.': '1086',
    'Juzgado De Garantía De Río Negro.': '1087',
    'Juzgado De Garantía De Osorno.': '1088',
    'Juzgado De Garantía De Castro.': '1089',
    'Juzgado De Garantía De Puerto Montt.': '1090',
    'Juzgado De Garantía De Puerto Varas.': '1091',
    'Juzgado De Garantía De Ancud.': '1092',
    'Tribunal De Juicio Oral En Lo Penal De Chillán.': '1093',
    'Tribunal De Juicio Oral En Lo Penal De Concepción.': '1094',
    'Tribunal De Juicio Oral En Lo Penal De Valdivia.': '1095',
    'Tribunal De Juicio Oral En Lo Penal Puerto Montt.': '1096',
    'Juzgado De Garantía De San Vicente De Tagua-Tagua.': '1097',
    'Juzgado De Letras Y Garantía De Litueche.': '1150',
    'Juzgado De Letras Y Garantía De Peralillo.': '1151',
    'Juzgado De Letras Y Garantía De Cabrero.': '1152',
    '1º Juzgado De Garantía De Santiago': '1220',
    '2º Juzgado De Garantía De Santiago': '1221',
    '3º Juzgado De Garantía De Santiago': '1222',
    '4º Juzgado De Garantía De Santiago': '1223',
    '5º Juzgado De Garantía De Santiago': '1224',
    '6º Juzgado De Garantía De Santiago': '1225',
    '7º Juzgado De Garantía De Santiago': '1226',
    '8º Juzgado De Garantía De Santiago': '1227',
    '9º Juzgado De Garantía De Santiago': '1228',
    '10º Juzgado De Garantía De Santiago': '1229',
    '11º Juzgado De Garantía De Santiago': '1230',
    '12º Juzgado De Garantía De Santiago': '1231',
    '13º Juzgado De Garantía De Santiago': '1232',
    '14º Juzgado De Garantía De Santiago': '1233',
    '15º Juzgado De Garantía De Santiago': '1234',
    'Juzgado De Garantía De Colina': '1235',
    'Juzgado De Garantía De Puente Alto': '1236',
    'Juzgado De Garantía De San Bernardo': '1237',
    'Juzgado De Garantía De Melipilla': '1238',
    'Juzgado De Garantía De Curacaví': '1239',
    'Juzgado De Garantía De Talagante': '1240',
    '1º Tribunal De Juicio Oral En Lo Penal De Santiago': '1244',
    '2º Tribunal De Juicio Oral En Lo Penal De Santiago': '1245',
    '3º Tribunal De Juicio Oral En Lo Penal De Santiago': '1246',
    '4º Tribunal De Juicio Oral En Lo Penal De Santiago': '1247',
    '5º Tribunal De Juicio Oral En Lo Penal De Santiago': '1248',
    '6º Tribunal De Juicio Oral En Lo Penal De Santiago': '1249',
    '7º Tribunal De Juicio Oral En Lo Penal De Santiago': '1250',
    'Tribunal De Juicio Oral En Lo Penal De Osorno': '1251',
    'Tribunal De Juicio Oral En Lo Penal Talagante': '1320',
    'Tribunal De Juicio Oral En Lo Penal Colina': '1321',
    'Tribunal De Juicio Oral En Lo Penal Puente Alto': '1322',
    'Tribunal De Juicio Oral En Lo Penal San Bernardo': '1323',
    'Tribunal Oral En Lo Penal De Los Angeles': '1325',
    'Tribunal Oral En Lo Penal De Cañete': '1326',
    'Tribunal Oral En Lo Penal De Castro': '1328',
    'Tribunal De Juicio Oral En Lo Penal De Melipilla': '1355',
    'Juzgado De Letras Y Garantia De Alto Hospicio': '1500',
    'Juzgado De Letras Y Garantia De Mejillones': '1501',
    'Juzgado De Letras Y Garantia De Cabo De Hornos': '1502',
    'Corte Suprema - Primera Instancia.': '6000',
    'Tribunal Juicio Oral En Lo Penal Prueba Iii': '8002',
    'Coordinacion': '8010'
  };

  // Mapeo de Tribunales COBRANZA
  const TRIBUNALES_MAP_COBRANZA = {
    'Jdo. de Letras y Garantía de Pozo Almonte': '6',
    'Juzgado de Letras de Tocopilla': '13',
    'Juzgado de Letras y Garantía de Maria Elena': '14',
    'Jdo. de Letras y Garantia de Taltal': '26',
    'Jdo. de Letras y Garantia de Chañaral': '27',
    'Juzgado de Letras de Diego de Almagro': '29',
    'Juzgado de Letras y Garantia de Freirina': '34',
    '1º Juzgado de Letras de Vallenar': '36',
    '2º Juzgado de Letras de Vallenar': '37',
    'Juzgado de Letras de Vicuña': '46',
    'Juzgado de Letras y Garantía de Andacollo': '47',
    '1º Juzgado de Letras de Ovalle': '48',
    '2º Juzgado de Letras de Ovalle': '49',
    '3º Juzgado de Letras de Ovalle': '50',
    'Juzgado de Letras y Garantía de Combarbalá': '51',
    'Juzgado de Letras de Illapel': '52',
    'Juzgado de Letras y Garantia de los Vilos': '53',
    '1º Juzgado de Letras de Quilpue': '83',
    '2º Juzgado de Letras de Quilpue': '84',
    'Jdo. de Letras de Villa Alemana': '85',
    'Juzgado de Letras de CasaBlanca': '86',
    'Jdo. de Letras de La Ligua': '87',
    'Juzgado de Letras y Garantía de Petorca': '88',
    '1º Juzgado de Letras de los Andes': '89',
    '2º Juzgado de Letras de los Andes': '90',
    'Juzgado de Letras y Garantia de Putaendo': '94',
    '1º Juzgado de Letras de Quillota': '96',
    '2º Juzgado de Letras de Quillota': '97',
    'Jdo. de Letras de La Calera': '98',
    'Juzgado de Letras de Limache': '99',
    'Otros tribunales': '100',
    '1º Juzgado de Letras de San Antonio': '101',
    '2º Juzgado de Letras de San Antonio': '102',
    'Juzgado de Letras y Garantía de Isla de Pascua': '103',
    'Jdo. de Letras de Rengo': '111',
    'Jdo. de Letras de San Vicente': '113',
    'Jdo. de Letras y Garantia de Peumo': '114',
    '1°Jdo. de Letras de San Fernando': '115',
    '2°Jdo. de Letras de San Fernando': '116',
    'Jdo. de Letras de Santa Cruz': '117',
    'Jdo. de Letras y Garantia de Pichilemu': '119',
    'Jdo. de Letras de Constitución': '126',
    'Juzgado de Letras y Garantía de Curepto': '127',
    'Juzgado de Letras y Garantía de Licanten': '132',
    'Juzgado de Letras de Molina': '133',
    '1º Juzgado de Letras de Linares': '135',
    '2º Juzgado de Letras de Linares': '136',
    'Juzgado de Letras de San Javier': '138',
    'Juzgado de Letras de Cauquenes': '139',
    'Juzgado de Letras y Garantía de Chanco': '140',
    'Juzgado de Letras de Parral': '141',
    '1º Juzgado de Letras de San Carlos': '147',
    'Juzgado de Letras de Yungay': '149',
    'Juzgado de Letras y Garantía de Bulnes': '150',
    'Juzgado de Letras y Garantía de Coelemu': '151',
    'Juzgado de Letras y Garantia de Quirihue': '152',
    'Juzgado de Letras y Garantía de Mulchen': '157',
    'Juzgado de Letras y Garantía de Nacimiento': '158',
    'Juzgado de Letras y Garantía de Laja': '159',
    'Juzgado de Letras y Garantía de Yumbel': '160',
    'Juzgado de Letras de Tome': '187',
    'Juzgado de Letras y Garantía de Florida': '188',
    'Juzgado de Letras y Garantía de Santa Juana': '189',
    'Juzgado de Letras y Garantía de Lota': '190',
    '1er Jdo. Cob. Laboral de Prueba': '9002',
    '2do Jdo. Cob. Laboral de Prueba': '9003',
    '1° Juzgado de Letras de Coronel': '191',
    '2° Juzgado de Letras de Coronel': '192',
    'Juzgado de Letras y Garantía de Lebu': '193',
    'Juzgado de Letras de Arauco': '194',
    'Juzgado de Letras y Garantía de Curanilahue': '195',
    'Juzgado de Letras de Cañete': '196',
    '1°Jdo. de Letras de angol': '204',
    'Juzgado de Letras y Garantia de Collipulli': '206',
    'Juzgado de Letras y Garantía de Traiguen': '207',
    'Juzgado de Letras de Victoria': '208',
    'Juzgado de Letras y Garantía de Curacautín': '209',
    'Juzgado de Letras de Loncoche': '210',
    'Juzgado de Letras de Pitrufquen': '211',
    'Juzgado de Letras de Villarrica': '212',
    'Juzgado de Letras de Nueva Imperial': '213',
    'Juzgado de Letras y Garantia de Pucón': '214',
    'Juzgado de Letras de Lautaro': '215',
    'Juzgado de Letras y Garantía de Carahue': '216',
    'Jdo. de Letras de Mariquina': '222',
    'Juzgado de Letras y Garantia de Paillaco': '223',
    'Juzgado de Letras de Los Lagos': '224',
    'Juzgado de Letras y Garantia de Panguipulli': '225',
    'Jdo. de Letras y Garantía de La Unión': '226',
    'Juzgado de Letras y Garantia de Rio Bueno': '227',
    '1º Juzgado de Letras de Puerto Varas': '238',
    'Juzgado de Letras y Garantía de Calbuco': '240',
    'Juzgado de Letras y Garantía de Maullin': '241',
    'Juzgado de Letras de Ancud': '243',
    'Juzgado de Letras y Garantía de Achao': '244',
    'Juzgado de Letras y Garantia de Chaiten': '245',
    'Jdo. de Letras de Letras y Garantia de Aysen': '248',
    'Juzgado de Letras y Garantia de Chile Chico': '249',
    'Juzgado de Letras y Garantia de Cochrane': '250',
    'Jdo. de Letras y Garantia de Puerto Natales': '257',
    'Juzgado de Letras y Garantia de Porvenir': '258',
    '1° Juzgado de Letras de Talagante': '373',
    '2° Juzgado de Letras de Talagante': '374',
    '1° Juzgado de Letras de Melipilla': '375',
    '1° Juzgado de Letras de Buin': '377',
    '2° Juzgado de Letras de Buin': '378',
    'Juzgado de Letras y Garantía de Santa Barbara': '385',
    'Juzgado de Letras y Garantia de Caldera': '386',
    'Jdo. de Letras de Colina': '387',
    'Juzgado de Letras de Peñaflor': '388',
    'Juzgado de Letras y Garantia de Los Muermo': '659',
    'Juzgado de Letras y Garantia de Quintero': '660',
    'Juzgado de Letras y Garantia de Tolten': '946',
    'Juzgado de Letras y Garantia de Puren': '947',
    'Juzgado de Letras y Garantia de Puerto Cisne': '996',
    'Juzgado de Letras y Garantía de Hualaihue': '1013',
    'Jdo. de Letras y Garantia de Litueche': '1150',
    'Jdo. de Letras y Garantia de Peralillo': '1151',
    'Juzgado de Letras y Garantía de Cabrero': '1152',
    'Jdo. Cob. Laboral y Previsional de Santiago': '1329',
    'Jdo. Cob. Laboral y Previsional de San Miguel': '1330',
    'Jdo. Cob. Laboral y Previsional de Valparaíso': '1331',
    'Jdo. Cob. Laboral y Previsional de Concepción': '1332',
    'Jdo. de Letras del Trabajo de arica': '1333',
    'Jdo. de Letras del Trabajo de Iquique': '1334',
    'Jdo. de Letras del Trabajo de Antofagasta': '1335',
    'Jdo. de Letras del Trabajo de Copiapo': '1336',
    'Jdo. de Letras del Trabajo de La Serena': '1337',
    'Jdo. de Letras del Trabajo de Rancagua': '1339',
    'Jdo. de Letras del Trabajo de Curicó': '1340',
    'Jdo. de Letras del Trabajo de Talca': '1341',
    'Juzgado de Letras del Trabajo de Chillan': '1342',
    'Jdo. de Letras del Trabajo de Temuco': '1344',
    'Jdo. de Letras del Trabajo de Valdivia': '1345',
    'Jdo. de Letras del Trabajo de Puerto Montt': '1346',
    'Jdo. de Letras del Trabajo Punta arenas': '1347',
    'Jdo. de Letras del Trabajo de San Bernardo': '1352',
    'Jdo. de Letras del Trabajo de Calama': '1357',
    'Jdo. de Letras del Trabajo de San Felipe': '1358',
    'Jdo. de Letras del Trabajo de Los Ángeles': '1359',
    'Jdo. de Letras del Trabajo de Osorno': '1360',
    'Jdo. de Letras del Trabajo de Castro': '1361',
    'Jdo. de Letras del Trabajo de Coyhaique': '1362',
    'Jdo. de Letras del Trabajo de Puente Alto': '1363',
    'Jdo. de Letras de Alto Hospicio': '1500',
    'Jdo. de Letras y Garantía de Mejillones': '1501',
    'Jdo. de Letras y Garantía de Puerto Williams': '1502'
  };

  // Mapeo de Competencias
  const COMPETENCIA_MAP = {
    'Corte Suprema': '1',
    'Corte de Apelaciones': '2',
    'Civil': '3',
    'Laboral': '4',
    'Penal': '5',
    'Cobranza': '6',
    'Familia': '7'
  };
  
  // Lista de cortes
  const cortesApelaciones = Object.keys(CORTES_MAP);
  
  // Obtener tribunales según competencia
  function getTribunalesPorCompetencia(competencia) {
    switch(competencia) {
      case 'Civil':
        return Object.keys(TRIBUNALES_MAP_CIVIL);
      case 'Laboral':
        return Object.keys(TRIBUNALES_MAP_LABORAL);
      case 'Penal':
        return Object.keys(TRIBUNALES_MAP_PENAL);
      case 'Cobranza':
        return Object.keys(TRIBUNALES_MAP_COBRANZA);
      default:
        return [];
    }
  }
  
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
          
          const tribunales = getTribunalesPorCompetencia(competencia);
          tribunales.forEach(tribunal => {
            const option = document.createElement('option');
            option.value = tribunal;
            option.textContent = tribunal;
            tribunalSelect.appendChild(option);
          });
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
        
        // Realizar búsqueda
        showLoading('Consultando información...', 'Esto puede tomar hasta 60 segundos.');
        
        const response = await fetch('/api/buscar-nombre', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          showError(result.error || 'Error en la búsqueda');
          hideLoading();
          return;
        }
        
        console.log('✅ Búsqueda completada:', result);
        showResults(result);
        
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
        results.innerHTML = '';
    }
}

function showResults(data) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;

    // Sanitizar y formatear el texto de traducción
    const formattedTranslation = data.translation ? data.translation.replace(/\n/g, '<br>') : 'No hay traducción disponible';
    const formattedRawData = data.rawData || 'No hay datos disponibles';

    const resultsHTML = `
    <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 md:p-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
        <div>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">Resultados de la Búsqueda</h2>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Mostrando resultados para: <span class="font-semibold">${data.searchInfo || 'N/A'}</span>
          </p>
          <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Competencia: ${data.competencia} | Tribunal: ${data.tribunal} | Año: ${data.año}
          </p>
        </div>
        <div class="flex items-center gap-2 mt-4 md:mt-0">
          <button onclick="imprimirResultados()" class="flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <span class="material-symbols-outlined text-base">print</span>
            Imprimir
          </button>
          <button onclick="nuevaBusqueda()" class="flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <span class="material-symbols-outlined text-base">search</span>
            Nueva Búsqueda
          </button>
        </div>
      </div>

      <!-- Línea de Tiempo de Scraping -->
      <div class="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 class="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">timeline</span>
          Línea de Tiempo del Proceso
        </h3>
        <div class="relative">
          <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-300 dark:bg-blue-700"></div>
          
          <div class="relative pl-12 pb-6">
            <div class="absolute left-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white text-xs font-bold">1</span>
            </div>
            <div class="bg-white dark:bg-zinc-700 p-4 rounded-lg shadow">
              <p class="font-semibold text-zinc-900 dark:text-white">Solicitud Recibida</p>
              <p class="text-sm text-zinc-600 dark:text-zinc-400">Búsqueda iniciada: ${data.tipoPersona === 'natural' ? 'Persona Natural' : 'Persona Jurídica'}</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-500 mt-1">${new Date(data.timestamp).toLocaleString('es-CL')}</p>
            </div>
          </div>

          <div class="relative pl-12 pb-6">
            <div class="absolute left-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white text-xs font-bold">2</span>
            </div>
            <div class="bg-white dark:bg-zinc-700 p-4 rounded-lg shadow">
              <p class="font-semibold text-zinc-900 dark:text-white">Extracción de Datos (Scraping)</p>
              <p class="text-sm text-zinc-600 dark:text-zinc-400">Datos obtenidos del sistema judicial</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Competencia: ${data.competencia}</p>
            </div>
          </div>

          <div class="relative pl-12 pb-6">
            <div class="absolute left-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white text-xs font-bold">3</span>
            </div>
            <div class="bg-white dark:bg-zinc-700 p-4 rounded-lg shadow">
              <p class="font-semibold text-zinc-900 dark:text-white">Procesamiento con IA</p>
              <p class="text-sm text-zinc-600 dark:text-zinc-400">Traducción a lenguaje simple completada</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Usando Gemini AI</p>
            </div>
          </div>

          <div class="relative pl-12">
            <div class="absolute left-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span class="text-white text-xs font-bold">✓</span>
            </div>
            <div class="bg-white dark:bg-zinc-700 p-4 rounded-lg shadow">
              <p class="font-semibold text-green-600 dark:text-green-400">Proceso Completado</p>
              <p class="text-sm text-zinc-600 dark:text-zinc-400">Resultados listos para visualización</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Columna de Datos Originales -->
        <div class="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <h3 class="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-primary">gavel</span>
            Datos Originales del Scraping
          </h3>
          <div class="h-96 overflow-y-auto pr-2 text-sm text-zinc-700 dark:text-zinc-300">
            <pre class="whitespace-pre-wrap font-mono">${formattedRawData}</pre>
          </div>
        </div>

        <!-- Columna de Explicación Simple -->
        <div class="p-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
          <h3 class="text-lg font-bold text-primary flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined">lightbulb</span>
            Respuesta Automatizada (IA)
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
    
    // Guardar datos globalmente para impresión
    window.currentSearchData = data;
}

// Función de impresión mejorada
window.imprimirResultados = function() {
    const data = window.currentSearchData;
    if (!data) {
        alert('No hay datos para imprimir');
        return;
    }

    const formattedRawData = data.rawData || 'No hay datos disponibles';
    const formattedTranslation = data.translation || 'No hay traducción disponible';
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Justicia Clara - Resultados de Búsqueda</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                h1 {
                    color: #059669;
                    border-bottom: 2px solid #059669;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #047857;
                    margin-top: 30px;
                }
                .info-section {
                    background-color: #f0f9ff;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .info-section p {
                    margin: 5px 0;
                }
                .data-section {
                    margin: 20px 0;
                    padding: 15px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background-color: #f9fafb;
                }
                .timeline {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: #eff6ff;
                    border-left: 4px solid #3b82f6;
                }
                .timeline-item {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    background-color: #f3f4f6;
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 12px;
                    color: #6b7280;
                    border-top: 1px solid #d1d5db;
                    padding-top: 20px;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 15px;
                    }
                }
            </style>
        </head>
        <body>
            <h1>Justicia Clara - Resultados de Búsqueda</h1>
            
            <div class="info-section">
                <p><strong>Tipo de Persona:</strong> ${data.tipoPersona === 'natural' ? 'Persona Natural' : 'Persona Jurídica'}</p>
                <p><strong>Búsqueda:</strong> ${data.searchInfo || 'N/A'}</p>
                <p><strong>Competencia:</strong> ${data.competencia || 'N/A'}</p>
                <p><strong>Tribunal:</strong> ${data.tribunal || 'N/A'}</p>
                <p><strong>Corte:</strong> ${data.corte || 'N/A'}</p>
                <p><strong>Año:</strong> ${data.año || 'N/A'}</p>
                <p><strong>Fecha de consulta:</strong> ${new Date(data.timestamp).toLocaleString('es-CL')}</p>
            </div>

            <div class="timeline">
                <h2>Proceso de Búsqueda</h2>
                <div class="timeline-item">
                    <strong>1. Solicitud Recibida:</strong> ${data.tipoPersona === 'natural' ? 'Persona Natural' : 'Persona Jurídica'}<br>
                    <em>${new Date(data.timestamp).toLocaleString('es-CL')}</em>
                </div>
                <div class="timeline-item">
                    <strong>2. Extracción de Datos:</strong> Scraping del sistema judicial completado<br>
                    <em>Competencia: ${data.competencia}</em>
                </div>
                <div class="timeline-item">
                    <strong>3. Procesamiento con IA:</strong> Traducción a lenguaje simple<br>
                    <em>Usando Gemini AI</em>
                </div>
                <div class="timeline-item">
                    <strong>4. Completado:</strong> Resultados procesados exitosamente
                </div>
            </div>

            <div class="data-section">
                <h2>Datos Originales del Scraping</h2>
                <pre>${formattedRawData}</pre>
            </div>

            <div class="data-section">
                <h2>Respuesta Automatizada (Inteligencia Artificial)</h2>
                <div>${formattedTranslation.replace(/\n/g, '<br>')}</div>
            </div>

            <div class="footer">
                <p>© 2024 Justicia Clara. Todos los derechos reservados.</p>
                <p>Documento generado automáticamente - No constituye asesoría legal</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
};

window.nuevaBusqueda = function() {
    hideMessages();
    const form = document.getElementById('form-busqueda-nombre');
    if (form) {
        form.reset();
        const naturalRadio = document.querySelector('input[name="tipo-persona"][value="natural"]');
        if (naturalRadio) {
            naturalRadio.checked = true;
            naturalRadio.dispatchEvent(new Event('change'));
        }
    }
    const formContainer = document.getElementById('form-busqueda-nombre');
    if (formContainer) {
        formContainer.scrollIntoView({
            behavior: 'smooth'
        });
    }
};
