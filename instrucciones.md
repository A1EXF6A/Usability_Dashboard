Analiza el proyecto existente **Usability Test Dashboard** y completa exclusivamente las funcionalidades que todavía están pendientes o incompletas.

## Instrucciones principales

1. Revisa la estructura y el código actual del proyecto para identificar qué funcionalidades ya están implementadas y cuáles faltan.
2. Conserva la arquitectura, tecnologías, estructura de carpetas, estilos y componentes existentes.
3. No reconstruyas la aplicación desde cero.
4. No modifiques funcionalidades que ya funcionan correctamente.
5. No agregues módulos nuevos que no estén contemplados en el proyecto.
6. Implementa directamente las funcionalidades faltantes, conectándolas correctamente con el frontend, backend y base de datos.
7. Evita crear interfaces de demostración, datos ficticios o funcionalidades que aparenten funcionar sin realizar operaciones reales.

## Funcionalidades que se deben completar

### 1. Módulo de inteligencia artificial

Completa las funcionalidades pendientes del asistente de IA para que permita:

- Analizar las observaciones registradas durante las pruebas de usabilidad.
- Generar resúmenes de los resultados de las evaluaciones.
- Identificar y clasificar problemas de usabilidad, como navegación, accesibilidad, diseño visual, comprensión del contenido e interacción.
- Asignar niveles de prioridad o gravedad a los problemas identificados.
- Proponer recomendaciones concretas para mejorar la aplicación evaluada.
- Generar historias de usuario a partir de los problemas detectados.
- Incluir criterios de aceptación y tareas sugeridas en las historias de usuario.
- Permitir revisar, editar y aprobar las propuestas generadas por la IA antes de incorporarlas al Product Backlog.

### 2. Product Backlog

Completa la gestión del Product Backlog para almacenar las mejoras identificadas durante las evaluaciones de usabilidad.

Debe permitir:

- Crear, visualizar, editar y eliminar elementos del backlog.
- Registrar historias de usuario y sus criterios de aceptación.
- Asignar prioridades y estimaciones de esfuerzo.
- Consultar el origen de cada mejora, relacionándola con el problema u observación que la generó.
- Buscar, filtrar y ordenar los elementos registrados.
- Incorporar las historias de usuario aprobadas desde el módulo de IA.

El Product Backlog debe contener las mejoras que se realizarán al sistema evaluado, no las tareas utilizadas para ejecutar las pruebas de usabilidad.

### 3. Gestión de Sprints

Completa las funcionalidades necesarias para administrar los Sprints:

- Crear, editar y eliminar Sprints.
- Definir nombre, objetivo, fecha de inicio y fecha de finalización.
- Seleccionar historias de usuario del Product Backlog para incorporarlas a un Sprint.
- Consultar las historias y tareas asignadas a cada Sprint.
- Visualizar el estado y progreso de cada Sprint.
- Mantener el historial de los Sprints anteriores.

### 4. Tablero Kanban

Completa el tablero de seguimiento de tareas para permitir:

- Visualizar las tareas organizadas por estado.
- Gestionar los estados: Pendiente, En progreso, En revisión y Terminado.
- Cambiar el estado de las tareas mediante arrastrar y soltar o controles accesibles.
- Consultar los detalles de cada tarea.
- Relacionar las tareas con sus historias de usuario y Sprints.
- Guardar los cambios de estado en la base de datos.

### 5. Asignación de tareas

Implementa las funcionalidades pendientes para:

- Asignar responsables a las tareas.
- Consultar las tareas asignadas a cada integrante.
- Modificar responsables y estados.
- Visualizar el avance de las actividades.
- Mantener la información sincronizada entre los usuarios.

### 6. Retrospectivas

Completa el módulo de retrospectivas para que cada Sprint permita registrar:

- Qué aspectos funcionaron correctamente.
- Qué problemas o dificultades se presentaron.
- Qué aspectos se pueden mejorar.
- Acciones de mejora para el siguiente Sprint.
- Responsables y estado de las acciones propuestas.

### 7. Evaluación y resultados de usabilidad

Completa las funcionalidades pendientes relacionadas con los resultados de las evaluaciones:

- Registrar y visualizar métricas de satisfacción.
- Mostrar los resultados de las pruebas de usabilidad.
- Presentar gráficos y estadísticas basados en los datos reales registrados.
- Comparar los resultados de las evaluaciones iniciales y finales.
- Mostrar diferencias en tiempos de ejecución, errores, tareas completadas, tasa de éxito y satisfacción.
- Generar informes con los resultados obtenidos.

La comparación debe utilizar datos reales disponibles y evitar presentar resultados ficticios.

## Requisitos técnicos

- Mantén las tecnologías y dependencias que utiliza actualmente el proyecto.
- Respeta la arquitectura existente del backend.
- Implementa correctamente las entidades, DTO, servicios, controladores y migraciones que sean necesarios.
- Conecta todas las operaciones con la base de datos existente.
- Asegura que el frontend consuma correctamente los endpoints del backend.
- Valida los datos ingresados y maneja adecuadamente los errores.
- No expongas claves API ni credenciales.
- Si existe una integración con Gemini u otro proveedor de IA, completa su funcionamiento respetando la configuración actual del proyecto.

## Validación final

Cuando termines:

1. Verifica que todas las funcionalidades pendientes estén implementadas.
2. Comprueba que las operaciones de creación, edición, consulta y eliminación funcionen correctamente.
3. Verifica la comunicación entre frontend, backend y base de datos.
4. Ejecuta las pruebas disponibles y corrige los errores encontrados.
5. Comprueba que las funcionalidades existentes continúen funcionando.
6. Informa qué funcionalidades fueron completadas, qué archivos fueron modificados y qué problemas no pudieron resolverse.

**IMPORTANTE:** El objetivo es exclusivamente completar las funcionalidades faltantes del proyecto actual. No rediseñes la aplicación, no cambies su arquitectura, no reconstruyas módulos que ya funcionan y no agregues características fuera del alcance indicado. Primero identifica lo que ya existe y después implementa únicamente lo que falta.