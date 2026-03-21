# Proyecto: Frontend de Gestion de Tareas y Usuarios (Punto D - Transferencia)

Este repositorio contiene la implementacion del **modulo frontend** desarrollado como parte de las actividades de apropiacion y transferencia de conocimiento de la guia GFPI-F-135 V04. El proyecto demuestra el dominio practico en la **manipulacion del DOM con JavaScript vanilla**, el consumo de APIs REST con `fetch()` y la organizacion modular del codigo.

## Integrantes y Roles

- **Lider de Proyecto:** Darcy Rubio
- **Desarrollador Frontend:** Jensen Rodriguez
- **Desarrollador Backend:** Jaider Esparza

## Proposito del Proyecto

El objetivo principal de este desarrollo es aplicar conceptos de arquitectura cliente-servidor para construir una interfaz web funcional que consuma los endpoints del backend. El frontend esta disenado para:

- **Consumir la API REST:** Conectar con el servidor backend mediante `fetch()` para operaciones CRUD de usuarios y tareas.
- **Manipular el DOM:** Crear, modificar y eliminar elementos HTML de forma dinamica usando `document.createElement()` y metodos del DOM.
- **Gestionar estado:** Mantener el estado de la aplicacion (usuario actual, tareas cargadas, filtros) sin frameworks externos.
- **Validar formularios:** Verificar la entrada del usuario de forma declarativa con reglas reutilizables.
- **Separar responsabilidades:** Organizar el codigo en capas (API, Servicios, UI, Utilidades) para facilitar el mantenimiento.

## Estructura del Proyecto

Se ha mantenido un criterio tecnico profesional en la organizacion de archivos, separando responsabilidades en capas independientes:

```
Transferencia_Frontend_Jensen/
├── README.md                          # Documentacion del proyecto
└── public/                            # Carpeta publica servida por Live Server
    ├── index.html                     # Vista principal: busqueda de usuario y gestion de tareas
    ├── admin.html                     # Vista admin: tablas CRUD de usuarios y tareas
    ├── misTareas.html                 # Vista usuario: consulta de tareas asignadas
    ├── styles.css                     # Estilos globales de la aplicacion
    └── JS/                            # Logica JavaScript organizada por capas
        ├── main.js                    # Punto de entrada de index.html
        ├── admin.js                   # Punto de entrada de admin.html
        ├── misTareas.js               # Punto de entrada de misTareas.html
        ├── api/                       # CAPA API: comunicacion HTTP con el servidor
        │   ├── tareasApi.js           # Endpoints de tareas (vista principal)
        │   ├── usuariosApi.js         # Endpoints CRUD de usuarios (panel admin)
        │   └── adminTareasApi.js      # Endpoints de tareas admin + mis tareas
        ├── services/                  # CAPA SERVICIOS: logica de negocio
        │   ├── tareasService.js       # Logica de busqueda, CRUD y filtros de tareas
        │   ├── usuariosService.js     # Logica de gestion de usuarios
        │   ├── adminTareasService.js  # Logica de tareas del panel admin
        │   └── misTareasService.js    # Logica de la vista "Mis Tareas"
        ├── ui/                        # CAPA UI: renderizado y manipulacion del DOM
        │   ├── tareasUI.js            # Tarjetas de tareas y formulario principal
        │   ├── usuariosUI.js          # Tabla de usuarios y modal de creacion/edicion
        │   ├── adminTareasUI.js       # Tabla de tareas admin y modal con select multiple
        │   └── misTareasUI.js         # Tarjetas de tareas del usuario final
        └── utils/                     # CAPA UTILIDADES: funciones reutilizables
            ├── validaciones.js        # Validacion declarativa de formularios
            ├── notificaciones.js      # Sistema de notificaciones flotantes (toast)
            ├── filtros.js             # Filtrado y ordenamiento de tareas en memoria
            └── exportaciones.js       # Exportacion de tareas a archivo JSON
```

## Vistas de la Aplicacion

### 1. Vista Principal (`index.html`) - Registro de Mensajes
Pagina de inicio donde el usuario se identifica con su numero de documento y puede gestionar sus tareas:
- **Busqueda de usuario:** Formulario que consulta el endpoint `GET /usuarios` y busca por documento.
- **CRUD de tareas:** Crear (`POST /tasks`), editar (`PUT /tasks/:id`) y eliminar (`DELETE /tasks/:id`) tareas.
- **Filtros y ordenamiento:** Filtrar tareas por estado y ordenar por campo de forma local (sin recargar).
- **Exportacion:** Descargar las tareas visibles como archivo `.json`.

### 2. Panel Administrativo (`admin.html`) - Gestion de Usuarios y Tareas
Panel completo de administracion con dos secciones:

**Gestion de Usuarios:**
- Tabla con todos los usuarios (`GET /usuarios`)
- Crear usuario (`POST /usuarios`)
- Editar usuario (`PUT /usuarios/:id`)
- Eliminar usuario (`DELETE /usuarios/:id`)
- Activar/Desactivar usuario (`PATCH /usuarios/:id`)

**Gestion de Tareas:**
- Tabla con todas las tareas (`GET /tasks`)
- Crear, editar y eliminar tareas
- Filtro por usuario y estado
- **Asignacion multiple de usuarios** a una tarea mediante `<select multiple>`

### 3. Vista de Usuario (`misTareas.html`) - Mis Tareas
Vista donde el usuario consulta sus tareas asignadas:
- Busqueda por documento del usuario
- Lista de tareas asignadas (`GET /tasks` filtrado por userId)
- Boton "Marcar como completada" (`PATCH /tasks/:id`)

## Arquitectura por Capas

El codigo sigue una arquitectura de **3 capas + utilidades**, donde cada capa tiene una responsabilidad unica:

| Capa | Carpeta | Responsabilidad |
|------|---------|----------------|
| **API** | `JS/api/` | Unica capa que hace `fetch()` al servidor. Retorna promesas con datos o lanza errores. |
| **Servicios** | `JS/services/` | Logica de negocio: coordina entre la API y la UI. Maneja el estado interno de la aplicacion. |
| **UI** | `JS/ui/` | Crea y modifica elementos del DOM con `document.createElement()`. No hace llamadas HTTP. |
| **Utilidades** | `JS/utils/` | Funciones puras y reutilizables: validacion, filtros, notificaciones, exportacion. |

### Flujo de datos

```
Usuario interactua con el DOM
        |
    main.js / admin.js / misTareas.js  (punto de entrada, event listeners)
        |
    services/  (logica de negocio, estado interno)
        |
   ┌────┴────┐
api/         ui/
(fetch)    (DOM)
```

## Como Ejecutar el Proyecto

### 1. Requisitos Previos
- **Node.js** (version LTS recomendada) y **npm** instalados.
- **Live Server** (extension de VS Code) o cualquier servidor HTTP local.
- El **backend** (json-server) debe estar corriendo en `http://localhost:3000`.

### 2. Iniciar el Backend
En la carpeta del backend (`Transferencia_Backend_Jaider`):
```bash
npx json-server -w db.json -p 3000
```
Esto expondra los endpoints:
- `http://localhost:3000/usuarios`
- `http://localhost:3000/tasks`

### 3. Iniciar el Frontend
Abrir la carpeta del proyecto en VS Code y ejecutar **Live Server** sobre `public/index.html`. La aplicacion se abrira en `http://127.0.0.1:5500/public/index.html`.

### 4. Navegacion entre Vistas
- **Inicio:** `index.html` - Busqueda de usuario y gestion de tareas
- **Panel Admin:** `admin.html` - CRUD de usuarios y tareas
- **Mis Tareas:** `misTareas.html` - Consulta de tareas asignadas

## Endpoints Consumidos

| Metodo | Endpoint | Descripcion | Vista |
|--------|----------|-------------|-------|
| `GET` | `/usuarios` | Obtener todos los usuarios | Admin, Principal |
| `POST` | `/usuarios` | Crear un nuevo usuario | Admin |
| `PUT` | `/usuarios/:id` | Actualizar un usuario | Admin |
| `DELETE` | `/usuarios/:id` | Eliminar un usuario | Admin |
| `PATCH` | `/usuarios/:id` | Activar/desactivar usuario | Admin |
| `GET` | `/tasks` | Obtener todas las tareas | Admin, Principal, Mis Tareas |
| `POST` | `/tasks` | Crear una nueva tarea | Admin, Principal |
| `PUT` | `/tasks/:id` | Actualizar una tarea | Admin, Principal |
| `DELETE` | `/tasks/:id` | Eliminar una tarea | Admin, Principal |
| `PATCH` | `/tasks/:id` | Marcar tarea completada / Asignar usuarios | Mis Tareas, Admin |

## Tecnologias Utilizadas

- **HTML5** - Estructura semantica de las vistas
- **CSS3** - Estilos con metodologia BEM
- **JavaScript ES6+** - Modulos (`import/export`), `async/await`, `fetch()`, `document.createElement()`
- **Font Awesome 6** - Iconos de la interfaz
- **Live Server** - Servidor de desarrollo local

## Criterios de Calidad Implementados

- **Criterio 8:** Cada vista consume correctamente sus endpoints mediante `fetch()`, permitiendo pruebas desde el navegador.
- **Criterio 10:** Codigo organizado en capas, con nomenclatura clara en espanol, separacion de responsabilidades y manejo de errores con `try/catch` en cada llamada a la API.

---

**Desarrollado por:** Jensen Rodriguez

**Programa:** Tecnologia en Analisis y Desarrollo de Software

**Fase:** Ejecucion - Frontend JavaScript
