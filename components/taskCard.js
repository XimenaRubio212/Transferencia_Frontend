/*
  crearTarjetaTarea(tarea, manejadores)
  - tarea: { id, titulo, descripcion, estado, prioridad }
  - manejadores: { alEditar(tarea), alEliminar(idTarea, elementoTarjeta) }
  retorna HTMLElement
*/
export function crearTarjetaTarea(tarea, manejadores = {}) {
  const { id, titulo, descripcion, estado, prioridad } = tarea;

  const tarjeta = document.createElement('div');
  tarjeta.className = 'message-card';
  tarjeta.dataset.id = id;
  let colorPrioridad = prioridad === 'Alta' ? '#ef4444' : prioridad === 'Media' ? '#f59e0b' : '#10b981';
  tarjeta.style.borderLeft = '5px solid ' + colorPrioridad;

  const encabezado = document.createElement('div');
  encabezado.className = 'message-card__header';

  const tituloNegrita = document.createElement('strong');
  tituloNegrita.textContent = titulo;

  const etiquetaEstado = document.createElement('span');
  etiquetaEstado.className = 'tag';
  etiquetaEstado.textContent = estado;

  encabezado.appendChild(tituloNegrita);
  encabezado.appendChild(etiquetaEstado);

  const parrafoDescripcion = document.createElement('p');
  parrafoDescripcion.textContent = descripcion;

  const textoPrioridad = document.createElement('small');
  textoPrioridad.textContent = 'Prioridad: ';
  const etiquetaPrioridad = document.createElement('span');
  etiquetaPrioridad.style.color = colorPrioridad;
  etiquetaPrioridad.textContent = prioridad;
  textoPrioridad.appendChild(etiquetaPrioridad);

  // Contenedor de acciones
  const contenedorAcciones = document.createElement('div');
  contenedorAcciones.className = 'message-card__actions';

  const botonEditar = document.createElement('button');
  botonEditar.className = 'btn btn--small btn--edit';
  botonEditar.textContent = 'Editar';
  botonEditar.addEventListener('click', () => {
    if (manejadores.alEditar) manejadores.alEditar(tarea);
  });

  const botonEliminar = document.createElement('button');
  botonEliminar.className = 'btn btn--small btn--danger';
  const iconoEliminar = document.createElement('i');
  iconoEliminar.classList.add('fa-solid', 'fa-trash');
  botonEliminar.appendChild(iconoEliminar);
  botonEliminar.addEventListener('click', async () => {
    if (manejadores.alEliminar) manejadores.alEliminar(id, tarjeta);
  });

  contenedorAcciones.appendChild(botonEditar);
  contenedorAcciones.appendChild(botonEliminar);

  tarjeta.appendChild(encabezado);
  tarjeta.appendChild(parrafoDescripcion);
  tarjeta.appendChild(textoPrioridad);
  tarjeta.appendChild(contenedorAcciones);

  return tarjeta;
}
