# PROMPT PARA AGENTE — Completar Usability Test Dashboard 2.0 para la entrega

## ROL Y OBJETIVO

Eres un ingeniero full-stack senior (.NET + React/TypeScript) con criterio UX. El repositorio **ya existe y funciona en gran parte**. Tu trabajo **no es reconstruirlo**, sino **completar lo que falta** para cumplir el enunciado del proyecto integrador *Usability Test Dashboard 2.0* (Interacción Humano-Computador, UTA, Nivel 5-A, Ing. José Caiza, Mg.) y dejarlo listo para entregar y sustentar.

## LO QUE YA EXISTE (no lo rehagas, extiéndelo)

- **Stack:** .NET 10 con Clean Architecture (`Domain`, `Application`, `Infrastructure`, `UsabilityDashboard_API`), EF Core + PostgreSQL (migraciones en `Infrastructure/Migrations`), validadores FluentValidation, AutoMapper, middleware de excepciones, Swagger. Frontend `frontend_beta/` con React + TypeScript + Vite. Docker Compose (`docker-compose.yml`, `Dockerfile.api`, `Dockerfile.frontend`, nginx).
- **Módulo 1 (Evaluaciones):** planes de prueba, guion del moderador, participantes, tareas, sesiones, `SessionRunner`, observaciones (éxito, tiempo, errores, comentarios, problema, severidad, mejora). Entidades `TestPlan`, `ModeratorScript`, `Participant`, `TestTask`, `TestSession`, `ObservationLog`, `Finding`, `ImprovementAction`.
- **Módulo 2 (Dashboard):** `Dashboard.tsx` + `DashboardController/Service` + `PieChart`, con avance por fase.
- **IA (parcial):** `Application/Services/SprintBacklogService.cs` llama a Gemini (`GEMINI_API_KEY`, `responseMimeType: application/json`) con fallback a un "motor local"; `components/AiCopilot.tsx` es un chat asistente. Hoy la IA **genera un Sprint Backlog completo**.
- **Backlog actual:** entidad `SprintBacklog` con `ContentJson` y `RawMarkdown`; página `SprintBacklog.tsx` con exportación `.md` e "Imprimir PDF" (`window.print`).
- **Accesibilidad:** página `Accessibility.tsx` (WAVE, Stark, Lighthouse) y uso de `aria-*`.
- Rutas en `frontend_beta/src/App.tsx`; menú lateral por fases en `components/Layout.tsx`; llamadas API en `src/api/index.ts`.

**Primero:** lee el código (arquitectura, `SprintBacklogService`, `AiCopilot`, `Layout`, `api/index.ts`, entidades y migraciones) y haz un inventario breve. Mantén el estilo, nombres y convenciones del repo (UI y textos en español).

## BRECHAS A CERRAR (en orden de prioridad)

### 1. Módulo SCRUM real (mayor brecha) — Rúbrica 1.0 + base del trazado UX→SCRUM
Hoy solo hay un "Sprint Backlog" guardado como JSON. Implementa un módulo nuevo y relacional, **digitalizando la matriz Excel de planificación** (`insumos/`). Backend (entidades + configuración EF + migración PostgreSQL + DTOs + validadores + servicios + controladores + Swagger) y frontend (páginas nuevas, rutas y entrada en el menú, sección "SCRUM"):

- **Product Backlog:** código HU (`HU-01`, o formato `RF.APL.01`), nombre, descripción, módulo, **Business Value**, **Story Points**, **cociente de decisión = BV / SP** (calculado en backend), orden sugerido por cociente (editable manualmente), estado y **vínculo opcional a un `Finding`/observación de origen** (trazabilidad hallazgo → historia). CRUD, filtros y reordenamiento.
- **Sprints:** número, objetivo, fechas inicio/fin, semanas, Product Owner, Scrum Master, **equipo con horas por día/semana y capacidad total del sprint** (calculada). Seed de 4 sprints: S1 sem. 10–11, S2 sem. 12–13, S3 sem. 14–15, S4 sem. 16. Asignar historias del backlog a un sprint.
- **Tareas del sprint:** historia, desarrollador, **fase** (Análisis/Diseño/Implementación/Pruebas), **tipo** (Nuevo/Error), descripción, **horas estimadas y reales**, estado, comentario. Totales por sprint y **alerta si lo estimado supera la capacidad**.
- **Tablero Kanban:** columnas Pendiente → En progreso → En revisión → Terminado, filtro por responsable, cambio de estado con drag & drop **y alternativa por teclado/botón** (accesible).
- **Tareas No Planificadas (TNP):** fecha, desarrollador, tarea, duración; total por sprint.
- **Daily Log (opcional):** avance, siguiente paso, impedimentos por integrante.
- **Sprint Review y Retrospectiva:** por sprint, qué se terminó/qué quedó pendiente, qué salió bien, qué salió mal, acuerdos. Persistidas.
- **Exportación** de la matriz de planificación a `.xlsx` con el mismo formato de la hoja original (usa una librería ligera, p. ej. ClosedXML/EPPlus-alternativa permitida por licencia, o exporta CSV si no es viable).
- **Seed** con las historias HU-01…HU-10 del enunciado (código, texto, prioridad, módulo, criterios de aceptación) como Product Backlog inicial.
- Mantén el "Sprint Backlog" existente funcionando; enlázalo o migra su contenido sin romperlo.

### 2. Asistente IA alineado al alcance acordado — Rúbrica 1.0
El equipo decidió que la IA **no genera backlogs completos**, sino que **refina observaciones** con la persona al mando. Ajusta sin romper lo existente:
- Nuevo endpoint `POST /api/ai/analyze-observations` (o equivalente) que recibe las observaciones/hallazgos del plan y devuelve **JSON estricto**: resumen de hallazgos, clasificación por categoría UX, **severidad** priorizada con justificación, recomendación **por pantalla** y **borradores de historias de usuario** (Como… quiero… para…) con **criterios de aceptación y prioridad**.
- **System prompt restrictivo:** rol de analista UX, responder solo en JSON con el esquema, español, sin inventar datos que no estén en las observaciones.
- **Validación tipo firewall** de la respuesta (DTO + FluentValidation o parseo defensivo): tolera JSON envuelto en markdown, campos faltantes (se rellenan con defaults), payload vacío, HTTP 500, JSON malformado y error de red. Con error o sin `GEMINI_API_KEY` → **fallback determinista por palabras clave** (filtro, lento, botón, formulario, navegación…), marcado `source: "mock"`.
- **Refactor para testabilidad:** extrae la lógica de Gemini a una interfaz (`IGeminiClient`/`IAiAnalysisService`) con `HttpClient` inyectado por `IHttpClientFactory` (hoy hay un `HttpClient` estático). Sin cambiar el comportamiento externo del Copiloto ni del generador actual.
- **UI "Asistente IA de observaciones"** (en la página de Observaciones o Hallazgos): estados **reposo → loading (con `aria-live`) → resolución/error con reintento**; resultados **editables** campo por campo; **color/etiqueta distintiva "Sugerido por IA"** frente al contenido humano; botón para **enviar las historias aceptadas al Product Backlog (SCRUM) vinculándolas al hallazgo de origen**. Nada se guarda sin confirmación.
- Exportación de lo generado a **Markdown** (copiar/descargar, listo para GitHub Issues con criterios en checklist) y a **PDF** (ver punto 5).

### 3. Exportación y reportes — Rúbrica de presentación
- Sustituir/complementar `window.print()` por un **reporte PDF formal con KPI** (tipografía profesional, indicadores: tasa de éxito, tiempo medio, errores, severidad, hallazgos, historias generadas), con descarga directa. Si no hay dependencia viable, deja una vista de impresión dedicada con estilos `@media print` bien cuidados y documenta la limitación.
- Mantén la exportación `.md` (copiar y descargar).

### 4. Usabilidad, accesibilidad y coherencia UI — Rúbrica 2.0 (implementación)
- Revisa formularios nuevos y existentes: validación en línea, mensajes de ayuda/error descriptivos, prevención de errores, confirmación antes de borrar.
- Contraste mínimo WCAG AA, foco visible, `label` asociado a cada input, navegación por teclado completa (incluido el Kanban), `aria-live` en toasts/cargas de IA, responsive básico.
- Navegación consistente: añade al menú las secciones nuevas (SCRUM, Rediseño, Comparativa) sin romper las fases actuales; etiquetas claras para usuarios nuevos (HU-10).
- Reutiliza los componentes/estilos existentes (`Modal`, `PlanSelector`, `PlanContext`, `index.css`); no introduzcas otra librería de UI.

### 5. Limpieza del repositorio
- Mover a `docs/` o eliminar del entregable: `ExamenPractica_Integrada_IHC_Usability_Test.pdf`, `exam_extracted.txt`, `logs.txt`; borrar `Class1.cs` vacíos, `WeatherForecast.cs` y la plantilla por defecto de Vite (`assets/react.svg`, `App.css` si no se usa); revisar `.agents/`, `skills-lock.json` y `package-lock.json` raíz (no deben ir si no aportan). Asegura que `.env`, claves y `logs` estén en `.gitignore` y **que no haya ninguna API key en el repo** (si encuentras una, avísame).
- Actualiza `README.md` (instalación, `.env.example` con `GEMINI_API_KEY`, etc).

### 6. Documentación y evidencias para la entrega
Crea en `docs/` (solo lo que no exista), con contenido real basado en el código y los insumos, y **marcando como "a validar por el equipo" todo dato de pruebas con usuarios**:
- `DIAGNOSTICO.md` (problemas de usabilidad detectados, severidad) y `EVALUACION.md` (matriz de usability test, **evaluación heurística de Nielsen**, revisión de accesibilidad, plantilla de prueba de tareas con compañeros, comparativa antes/después).
- `PROTOTIPOS.md` con el user flow y wireframes Lo-Fi/Mid-Fi/Hi-Fi de las pantallas nuevas (Mermaid/SVG/HTML; sin inventar capturas).
- `ARQUITECTURA.md`: diagrama de capas, flujo frontend ↔ API ↔ Gemini ↔ fallback, pipeline de exportación, modelo de datos con las entidades nuevas, esquema JSON de la IA.
- `INFORME_FINAL.md` con la estructura exigida: portada y datos del equipo · introducción · diagnóstico · usuarios, tareas y contexto de uso · problemas y backlog priorizado · rediseño y prototipos · implementación · módulo IA (objetivo, entradas, salidas) · módulo SCRUM (backlog, sprints, retrospectiva) · evaluación final y comparación antes/después · conclusiones y recomendaciones · anexos.
- `SUSTENTACION.md`: guion de exposición (problema, pivot de alcance de la IA, UX, arquitectura, ingeniería de prompt, QA, trazabilidad, demo, trabajo futuro: co-creación asistida, prompt chaining con agentes especializados, integración con Jira/Azure DevOps).
- `CHECKLIST_ENTREGA.md`: marca cada ítem con su evidencia — diagnóstico inicial · prototipos · módulo IA implementado con salida útil y explicable · módulo SCRUM completo (backlog, tablero, retrospectiva) · evaluación final con matriz · comparativa antes/después · sustentación preparada.

## REGLAS
- No reescribas ni cambies el stack; no agregues dependencias innecesarias (justifica las que sumes).
- No rompas funcionalidad existente
- Migraciones EF: una por cambio coherente, con nombre descriptivo, probadas contra PostgreSQL (docker-compose).
- Nunca hardcodees secretos. Textos de interfaz y documentación en español.
- No inventes resultados de pruebas con usuarios ni capturas: usa plantillas, campos y datos de demostración rotulados.
- Si una tarea no cabe razonablemente, entrégala en su versión mínima viable y regístrala en `docs/DECISIONES.md`.
