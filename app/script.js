/* ==========================================================
   Asistente del Barrio · chat estilo WhatsApp (maqueta)
   Todos los datos son de muestra.
   ========================================================== */

const chat = document.querySelector('#chat');
const formulario = document.querySelector('#form');
const campo = document.querySelector('#in');


/* ---------- Estado de la conversación ---------- */

let estado;            // pedido, quejas y datos que el usuario va dando
let esperando = null;  // nombre del paso que espera lo que escriba el usuario

function reiniciarEstado() {
  estado = { pedido: [], quejas: [], folio: 122 };
}
reiniciarEstado();


/* ---------- Datos de muestra ---------- */

// dias: 0 = domingo ... 6 = sábado
const tianguis = [
  {
    nombre: 'Tianguis Cultural del Chopo',
    colonia: 'guerrero',
    dias: [6],
    horario: 'Sábados (10:00 AM - 5:00 PM)',
    ubicacion: 'Aldama y Buenavista',
    distancia: '400 m',
    secciones: ['Música y Vinilos', 'Ropa y Calzado'],
  },
  {
    nombre: 'Tianguis San Fernando',
    colonia: 'guerrero',
    dias: [0],
    horario: 'Domingos (9:00 AM - 3:00 PM)',
    ubicacion: 'Plaza San Fernando',
    distancia: '850 m',
    secciones: ['Alimentos'],
  },
];

// tianguis: posición del tianguis en la lista de arriba
const puestos = [
  { nombre: 'Rock & Vinyl “El Abuelo”', tianguis: 0, seccion: 'Música y Vinilos', numero: '42', lugar: 'Pasillo central / Carpa roja', especialidad: 'Vinilos de colección y discos de Rock' },
  { nombre: 'Discos La Aguja', tianguis: 0, seccion: 'Música y Vinilos', numero: '17', lugar: 'Pasillo norte', especialidad: 'Cassettes, CDs y tornamesas' },
  { nombre: 'Ropa Vintage La Chula', tianguis: 0, seccion: 'Ropa y Calzado', numero: '8', lugar: 'Carpa azul', especialidad: 'Chamarras y playeras de segunda mano' },
  { nombre: 'Tamales Doña Chela', tianguis: 1, seccion: 'Alimentos', numero: '3', lugar: 'Entrada principal', especialidad: 'Tamales y atole' },
];

// Negocios que se pueden buscar al levantar o consultar quejas (solo existe Jamaica)
const negocios = ['Tacos Doña Mary', 'Frutas y Verduras Lupita', 'Carnitas El Güero'];

// Quejas que ya pasaron revisión y son visibles para otros usuarios
const quejasPublicadas = {
  'Tacos Doña Mary': [
    ['12 oct', 'cobro mayor al precio anunciado'],
    ['03 oct', 'demora en la atención'],
  ],
};


/* ---------- Utilidades ---------- */

// Minúsculas y sin acentos, para comparar textos
function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// Evita que lo que escribe el usuario se interprete como HTML
function escapar(texto) {
  const reemplazos = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  return String(texto).replace(/[&<>"]/g, letra => reemplazos[letra]);
}

function hora() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Convierte [['Puesto', 'Tacos'], ...] en líneas "Puesto: Tacos"
function lineas(pares) {
  return pares.map(([titulo, valor]) => `<b>${titulo}:</b> ${valor}`).join('<br>');
}


/* ---------- Mensajes ---------- */

// Agrega una burbuja al chat y baja hasta ella
function agregarBurbuja(html, clase) {
  const burbuja = document.createElement('div');
  burbuja.className = 'm ' + clase;
  burbuja.innerHTML = html + `<span class="t">${hora()}</span>`;
  chat.append(burbuja);
  chat.scrollTop = chat.scrollHeight;
  return burbuja;
}

// Burbuja verde: lo que dice el usuario
function mensajeUsuario(texto) {
  agregarBurbuja(escapar(texto), 'me');
}

// Burbuja blanca del bot, con botones opcionales.
//   botones:   [['Texto del botón', 'nombreDelPaso', datoOpcional], ...]
//   siguiente: paso que recibirá lo próximo que escriba el usuario
function mensajeBot(html, botones = [], siguiente = null) {
  esperando = null;
  const escribiendo = agregarBurbuja('<i>escribiendo…</i>', '');

  setTimeout(() => {
    escribiendo.remove();
    agregarBurbuja(html, '');

    const grupo = [];
    botones.forEach(([texto, paso, dato]) => {
      const boton = document.createElement('button');
      boton.className = 'b';
      boton.textContent = texto;
      boton.onclick = () => {
        grupo.forEach(b => (b.disabled = true)); // ya se eligió una opción
        mensajeUsuario(texto);
        pasos[paso](dato);
      };
      grupo.push(boton);
      chat.append(boton);
    });

    esperando = siguiente;
    chat.scrollTop = chat.scrollHeight;
  }, 600);
}


/* ==========================================================
   Pasos de la conversación
   Cada paso es una pantalla del bot.
   ========================================================== */

const pasos = {

  /* ----- Menú principal ----- */

  menu() {
    mensajeBot(
      '¡Quihubo, vecina! Soy tu <b>Asistente del Barrio</b>. Aquí le echamos la mano al comercio de nuestra colonia. ¿Qué andas buscando?',
      [['1. Vender y surtir', 'vender'], ['2. Comprar en mi barrio', 'comprar'], ['3. Cuidemos el barrio', 'barrio']]
    );
  },

  noEntendi() {
    mensajeBot('No te entendí. Toca una opción o escribe «menú».', [['Menú', 'menu']]);
  },


  /* ----- Rama 1: vender y surtir ----- */

  vender() {
    mensajeBot('¡Qué bueno verte por aquí, casera! ¿Qué quieres hacer hoy?',
      [['Activar mi puesto', 'registro'], ['Surtirme en la Central', 'surtir'], ['Cobros y facturas', 'cobros']]);
  },

  cobros() {
    mensajeBot('Cobros con QR y facturas para tu puesto vienen pronto; esta maqueta aún no los incluye.',
      [['Volver al menú', 'menu']]);
  },

  registro() {
    mensajeBot('¡Va! Vamos a darte de alta, no tardas ni 3 minutos. ¿Cómo se llama tu negocio?', [], 'registroListo');
  },

  registroListo(nombre) {
    mensajeBot(
      `¡Listo, así quedó tu puesto!
       <div class="card">
         <b>${escapar(nombre)}</b><br>
         Vende: jitomate, cebolla, chile, limón, aguacate<br>
         Dónde: Mercado de Jamaica, V. Carranza<br>
         Horario: martes a domingo, 7:00 a 16:00<br>
         Pagos: efectivo y transferencia / QR<br>
         Oferta: limón, 3 kilos por $50
       </div>
       ¿Todo bien?`,
      [['Todo correcto', 'registroOk'], ['Corregir algo', 'registro']]
    );
  },

  registroOk() {
    mensajeBot('¡Va que va! Tu puesto quedó activo en el barrio. Cuando quieras, te surtes en la Central.',
      [['Surtirme en la Central', 'surtir'], ['Menú', 'menu']]);
  },

  surtir() {
    mensajeBot(
      '¡A surtir se ha dicho! La Central manda el pedido junto con los de tus vecinos, y entre más pedimos juntos, más barato sale. ¿Qué insumos necesitas esta semana?',
      [
        ['Verduras y frutas', 'categoria', 'verduras'],
        ['Alimento de origen animal', 'categoria', 'Alimento de origen animal'],
        ['Abarrotes', 'categoria', 'Abarrotes'],
        ['Ropa y calzado', 'categoria', 'Ropa y calzado'],
        ['Ver mi orden actual', 'miPedido'],
      ]
    );
  },

  categoria(nombre) {
    if (nombre === 'verduras') {
      mensajeBot('Va con verduras y frutas. ¿Cuál te hace falta?', [
        ['Jitomate', 'producto', 'Jitomate'],
        ['Cebolla', 'producto', 'Cebolla'],
        ['Limón', 'producto', 'Limón'],
        ['Otro', 'otroProducto'],
      ]);
    } else {
      mensajeBot(`Va con ${nombre.toLowerCase()}. ¿Qué producto necesitas?`, [], 'producto');
    }
  },

  otroProducto() {
    mensajeBot('¿Qué producto necesitas?', [], 'producto');
  },

  producto(nombre) {
    estado.producto = nombre;
    mensajeBot(`¿Cuántas cajas o bultos de ${escapar(nombre.toLowerCase())} necesitas?`, [], 'cantidad');
  },

  cantidad(texto) {
    // Si solo escribió un número, se entiende que son cajas
    const cantidad = /^\d+$/.test(texto) ? texto + ' cajas' : texto;
    estado.pedido.push([estado.producto, cantidad]);

    mensajeBot(
      `¡Anotado! Sumamos ${escapar(cantidad)} de ${escapar(estado.producto.toLowerCase())} a la Orden Masiva del Barrio. Con el pedido consolidado obtendrás entre 5% y 25% de descuento. Te notificaremos el día de entrega.`,
      [['Agregar otro producto', 'surtir'], ['Ver mi orden', 'miPedido'], ['Terminar', 'terminarPedido']]
    );
  },

  miPedido() {
    const hayPedido = estado.pedido.length > 0;
    const detalle = estado.pedido
      .map(([producto, cantidad]) => `${escapar(cantidad)} de ${escapar(producto.toLowerCase())}`)
      .join('<br>');

    mensajeBot(hayPedido ? `Tu orden actual:<div class="card">${detalle}</div>` : 'Tu orden está vacía.',
      [['Agregar producto', 'surtir'], ['Menú', 'menu']]);
  },

  terminarPedido() {
    mensajeBot('¡Gracias, casera! Tu pedido queda en la Orden Masiva. Aquí estaré cuando me necesites.',
      [['Menú', 'menu']]);
  },


  /* ----- Rama 2: comprar en mi barrio (tianguis) ----- */

  comprar() {
    mensajeBot('Te ayudo a encontrar tianguis y comercios cerca de ti, y a hablar directo con quien te vende. ¿Qué estás buscando hoy?',
      [['Tianguis de hoy', 'tianguisHoy'], ['Buscar por colonia', 'pedirColonia'], ['Locales con pago QR', 'localesQR']]);
  },

  tianguisHoy() {
    const hoy = new Date().getDay();
    const todos = tianguis.map((tianguis, indice) => ({ tianguis, indice }));
    const abiertos = todos.filter(({ tianguis }) => tianguis.dias.includes(hoy));
    const lista = abiertos.length ? abiertos : todos;

    mensajeBot(
      abiertos.length ? 'Estos tianguis abren hoy:' : 'Hoy no abre ninguno en la maqueta. Estos son los tianguis disponibles:',
      lista.map(({ tianguis, indice }) => [`${tianguis.nombre} · ${tianguis.distancia}`, 'fichaTianguis', indice])
    );
  },

  pedirColonia() {
    mensajeBot('Escribe el nombre de tu colonia (ejemplo: Guerrero)', [], 'buscarColonia');
  },

  buscarColonia(texto) {
    const encontrados = tianguis
      .map((tianguis, indice) => ({ tianguis, indice }))
      .filter(({ tianguis }) => normalizar(texto).includes(tianguis.colonia));

    if (encontrados.length === 0) {
      mensajeBot('No encontré tianguis en esa colonia. Prueba con «Guerrero».', [], 'buscarColonia');
      return;
    }
    mensajeBot(
      `Encontré estos tianguis cerca de Col. ${escapar(texto.toUpperCase())}:`,
      encontrados.map(({ tianguis, indice }) => [`${tianguis.nombre} · ${tianguis.distancia}`, 'fichaTianguis', indice])
    );
  },

  fichaTianguis(indice) {
    const t = tianguis[indice];
    mensajeBot(
      `<b>${t.nombre}</b><br>
       Días: ${t.horario}<br>
       Ubicación: ${t.ubicacion}<br>
       Pagos: Efectivo, CoDi y Transferencia<br>
       Elige una sección:`,
      t.secciones.map(seccion => [seccion, 'seccion', `${indice}|${seccion}`])
    );
  },

  seccion(dato) {
    const [indice, seccion] = dato.split('|');
    const botones = [];

    puestos.forEach((puesto, i) => {
      if (puesto.tianguis === Number(indice) && puesto.seccion === seccion) {
        botones.push([puesto.nombre, 'fichaPuesto', i]);
      }
    });
    mensajeBot(`${seccion} - elige un puesto:`, botones);
  },

  fichaPuesto(i) {
    const p = puestos[i];
    mensajeBot(
      `<b>${p.nombre}</b><br>
       Puesto #${p.numero} (${p.lugar})<br>
       ${p.especialidad}<br>
       Pagos: Efectivo, CoDi y Transferencia<br>
       ¿Qué deseas hacer?`,
      [['Contactar', 'contactar', i], ['Pagar / QR', 'pagar', i], ['Menú', 'menu']]
    );
  },

  contactar(i) {
    const mensaje = encodeURIComponent(`Hola, vi tu puesto “${puestos[i].nombre}” en TianguisVecino`);
    mensajeBot(
      `Toca el enlace para chatear directo con el vendedor:<br>
       <a href="https://wa.me/525500000000?text=${mensaje}" target="_blank" rel="noopener">wa.me/525500000000</a><br>
       <small>Número de muestra.</small>`,
      [['Pagar / QR', 'pagar', i], ['Menú', 'menu']]
    );
  },

  pagar(i) {
    mensajeBot(
      `<b>Pago digital</b> - ${puestos[i].nombre}<br>
       Transfiere a la CLABE:
       <div class="card">012180000000000000</div>
       Con esta compra sumas 1 sello a tu Pasaporte Vecinal.<br>
       <small>CLABE de muestra. El bot no confirma el pago: el vendedor debe avisar.</small>`,
      [['Menú', 'menu']]
    );
  },

  localesQR() {
    mensajeBot('Locales que aceptan pago QR / CoDi:',
      puestos.map((puesto, i) => [puesto.nombre, 'fichaPuesto', i]));
  },


  /* ----- Rama 3: Cuidemos el barrio ----- */

  barrio() {
    mensajeBot('Aquí nos cuidamos entre vecinos. ¿Qué necesitas?', [
      ['Grupos de mi colonia', 'grupos'],
      ['Cómo denunciar', 'denunciar'],
      ['Seguridad de mis datos', 'datos'],
      ['Quejas al comerciante', 'quejas'],
    ]);
  },

  grupos() {
    mensajeBot('Existen grupos de comerciantes por colonia para avisarse y apoyarse entre vecinos. ¿En qué colonia está tu negocio?',
      [], 'ofrecerGrupo');
  },

  ofrecerGrupo(colonia) {
    estado.colonia = colonia;
    mensajeBot(
      `Encontré el grupo de comerciantes de ${escapar(colonia)}. Antes de unirte, ten presente que los demás integrantes podrán ver tu número de teléfono.`,
      [['Unirme', 'unirme'], ['Ahora no', 'ahoraNo']]
    );
  },

  unirme() {
    mensajeBot(`¡Bienvenido al grupo de comerciantes de ${escapar(estado.colonia)}! Si quieres salir, escribe «borrar mis datos».`,
      [['Volver al menú', 'menu']]);
  },

  ahoraNo() {
    mensajeBot('Sin problema, aquí seguimos cuando quieras.', [['Volver al menú', 'menu']]);
  },

  denunciar() {
    const vias = lineas([
      ['Peligro inmediato', '911'],
      ['Denuncia anónima', '089'],
      ['Página del C5', '[enlace oficial verificado]'],
      ['Guía para denunciar', '[enlace]'],
    ]);
    mensajeBot(
      `Si te están pidiendo cobros o te han amenazado, es una situación grave y no tienes que enfrentarla solo. Estas son las vías para denunciar:
       <div class="card">${vias}</div>
       Si hay peligro en este momento, llama al 911. Este asistente no sustituye una denuncia formal.`,
      [['Ver guía', 'guia'], ['Volver al menú', 'menu']]
    );
  },

  guia() {
    mensajeBot('La guía para denunciar se publicará aquí. Los enlaces de esta maqueta son de muestra.',
      [['Cuidemos el barrio', 'barrio']]);
  },

  datos() {
    mensajeBot(
      'Tu información se trata con cuidado. Solo guardamos el nombre de tu local, lo que vendes, su ubicación y tu horario de disponibilidad. No los vendemos ni los compartimos con terceros. Puedes pedir que los corrijamos o eliminemos escribiendo «borrar mis datos».',
      [['Aviso de privacidad completo', 'privacidad']]
    );
  },

  privacidad() {
    mensajeBot('El aviso de privacidad completo se publicará aquí (enlace de muestra).', [['Menú', 'menu']]);
  },

  borrarDatos() {
    reiniciarEstado();
    mensajeBot('Listo: borré tus datos de grupos, pedidos y quejas de esta conversación. Cuando quieras, empezamos de nuevo.',
      [['Menú', 'menu']]);
  },

  replica() {
    mensajeBot('Derecho de réplica: si eres el comerciante, escribe a replicas@ejemplo.mx (correo de muestra) con el folio de la queja y tu versión. Hoy la verificación es manual.',
      [['Menú', 'menu']]);
  },


  /* ----- Quejas al comerciante ----- */

  quejas() {
    mensajeBot(
      'Aquí puedes reportar problemas con el servicio de un comerciante, como cobros indebidos o mal trato. Si lo que vives es extorsión, la información para denunciar está en <b>Cómo denunciar</b>.',
      [['Levantar una queja', 'levantarQueja'], ['Consultar quejas de un puesto', 'consultarQuejas'], ['Cómo denunciar', 'denunciar']]
    );
  },

  levantarQueja() {
    estado.modo = 'levantar';
    mensajeBot('Gracias por avisar. Te pediré algunos datos. ¿En qué colonia está el puesto?', [], 'pedirNombrePuesto');
  },

  consultarQuejas() {
    estado.modo = 'consultar';
    mensajeBot('¿En qué colonia está el puesto?', [], 'pedirNombrePuesto');
  },

  pedirNombrePuesto(colonia) {
    estado.coloniaPuesto = colonia;
    mensajeBot('¿Cómo se llama el puesto o negocio?', [], 'buscarPuesto');
  },

  buscarPuesto(texto) {
    // En la maqueta solo hay negocios en Jamaica
    const esJamaica = normalizar(estado.coloniaPuesto) === 'jamaica';
    const coincidencias = esJamaica
      ? negocios.filter(nombre => normalizar(nombre).includes(normalizar(texto)))
      : [];

    if (coincidencias.length === 0) {
      mensajeBot('No encontré ese puesto en esa colonia (en la maqueta solo existe Jamaica). Prueba con otro nombre, por ejemplo «Mary».',
        [], 'buscarPuesto');
      return;
    }
    mensajeBot(`Encontré estos en ${escapar(estado.coloniaPuesto)}. ¿Cuál es?`,
      [...coincidencias.map(nombre => [nombre, 'elegirPuesto', nombre]), ['Ninguno', 'ninguno']]);
  },

  ninguno() {
    mensajeBot('Sin problema. Escribe otro nombre para buscar de nuevo.', [], 'buscarPuesto');
  },

  elegirPuesto(nombre) {
    estado.queja = { puesto: nombre, colonia: estado.coloniaPuesto };

    if (estado.modo === 'levantar') {
      mensajeBot('Cuéntame brevemente qué ocurrió. Describe solo los hechos, sin insultos ni datos personales de otras personas.',
        [], 'recibirHechos');
    } else {
      pasos.mostrarQuejas(nombre);
    }
  },

  recibirHechos(texto) {
    estado.queja.hechos = texto;
    mensajeBot('¿Quieres adjuntar una foto como evidencia? Es opcional. Procura que no aparezcan personas.',
      [['Adjuntar foto', 'adjuntarFoto'], ['Omitir', 'omitirFoto']]);
  },

  adjuntarFoto() {
    estado.queja.foto = true;
    mensajeUsuario('Foto adjunta (1)');
    pasos.revisarQueja();
  },

  omitirFoto() {
    estado.queja.foto = false;
    pasos.revisarQueja();
  },

  revisarQueja() {
    const q = estado.queja;
    const resumen = lineas([
      ['Puesto', escapar(q.puesto)],
      ['Colonia', escapar(q.colonia)],
      ['Queja', escapar(q.hechos)],
      ['Foto', q.foto ? '1 adjunta' : 'sin foto'],
    ]);
    mensajeBot(`Revisa tu queja. ¿Es correcta?<div class="card">${resumen}</div>`,
      [['Enviar', 'enviarQueja'], ['Corregir', 'corregirQueja']]);
  },

  corregirQueja() {
    mensajeBot('Va, cuéntame de nuevo qué ocurrió (solo hechos).', [], 'recibirHechos');
  },

  enviarQueja() {
    estado.folio++;
    // Queda pendiente: nunca se muestra a otros hasta que un moderador la publique
    estado.quejas.push({ ...estado.queja, estatus: 'pendiente' });

    const folio = String(estado.folio).padStart(4, '0');
    mensajeBot(
      `Tu queja quedó registrada con el folio <b>#${folio}</b>. Será revisada antes de mostrarse a otros usuarios.<br>
       <small>Ciclo: pendiente → revisión por moderador → publicada (o rechazada).</small>`,
      [['Menú', 'menu']]
    );
  },

  mostrarQuejas(nombre) {
    const lista = quejasPublicadas[nombre] || [];
    const detalle = lista.map(([fecha, texto]) => `<b>${fecha}:</b> ${texto}`).join('<br>');

    mensajeBot(
      lista.length
        ? `${escapar(nombre)} (${escapar(estado.coloniaPuesto)}) tiene ${lista.length} quejas publicadas:
           <div class="card">${detalle}</div>
           Son opiniones de usuarios y no están verificadas. Si eres el comerciante y quieres responder, escribe «responder».`
        : `${escapar(nombre)} no tiene quejas publicadas.`,
      [['Ver más', 'verMas'], ['Nueva consulta', 'consultarQuejas'], ['Menú', 'menu']]
    );
  },

  verMas() {
    mensajeBot('No hay más quejas publicadas para este puesto.',
      [['Nueva consulta', 'consultarQuejas'], ['Menú', 'menu']]);
  },
};


/* ==========================================================
   Texto escrito por el usuario
   ========================================================== */

function enviarTexto() {
  const texto = campo.value.trim();
  if (!texto) return;

  campo.value = '';
  mensajeUsuario(texto);
  const clave = normalizar(texto);

  // Comandos que funcionan en cualquier momento
  if (clave === 'borrar mis datos') return pasos.borrarDatos();
  if (['hola', 'menu', 'inicio', 'tianguis'].includes(clave)) return pasos.menu();
  if (clave === 'responder') return pasos.replica();

  // Si el bot estaba esperando un dato, se lo pasamos a ese paso
  if (esperando) return pasos[esperando](texto);

  // Atajos del menú principal: 1, 2 y 3
  const atajos = { 1: 'vender', 2: 'comprar', 3: 'barrio' };
  pasos[atajos[clave] || 'noEntendi']();
}

formulario.onsubmit = evento => {
  evento.preventDefault();
  enviarTexto();
};


/* ---------- Inicio ---------- */

pasos.menu();
