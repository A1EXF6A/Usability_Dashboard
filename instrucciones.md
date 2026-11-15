# PROMPT PARA AGENTE — Rediseño visual del frontend (colores y estilos)


## ROL Y OBJETIVO

Eres un diseñador-desarrollador front-end senior con criterio UX y accesibilidad. Debes **rediseñar la apariencia (colores, tipografía, espaciado, componentes y estilos)** del frontend de *Usability Test Dashboard 2.0* **sin cambiar su funcionalidad, rutas, llamadas a la API ni lógica**. El resultado debe verse como un producto profesional, coherente y distintivo, no como una plantilla genérica, y debe **mejorar la usabilidad y la accesibilidad** (es parte de un proyecto de Interacción Humano-Computador evaluado con Diseño Centrado en el Usuario).


## ESTADO ACTUAL (confirmado en el código)

- Stack: React 19 + TypeScript + Vite 8, `react-router-dom` 7, íconos `lucide-react`. **CSS plano**, sin Tailwind ni librería de UI.
- Estilos concentrados en `src/index.css` (~6.900 líneas, ~730 clases) y `src/App.css` (resto de la plantilla de Vite, probablemente sin uso).
- Ya existen **variables CSS en `:root`** (`index.css` ~líneas 100–200): escala `--neutral-50…900`, `--color-primary*` (azul `#1d4ed8`), `--color-success/warning/error*`, `--surface-*`, `--text-*`, `--border-*`, `--font-*` (Inter / Segoe UI), tamaños y pesos. Esto permite re-tematizar desde los tokens, pero **hay colores hexadecimales/rgba sueltos** en el resto del CSS y **unos 330 `style={{…}}` inline** repartidos en páginas y componentes (`AiCopilot`, `Accessibility`, `SessionRunner`, `SprintBacklog`, `Findings`, `ImprovementActions`, `TestPlans`, `Observations`, `Dashboard`, `Layout`, etc.).
- Estructura: `components/` (`Layout`, `Modal`, `PlanSelector`, `PieChart`, `AiCopilot`, `Portal`), `pages/` (Dashboard, TestPlans, ModeratorScript, Participants, Tasks, TestSessions, SessionRunner, Observations, Findings, ImprovementActions, Accessibility, SprintBacklog), `hooks/`, `context/`. Menú lateral en tres fases (Preparación, Ejecución, Análisis y Cierre).

## DIRECCIÓN DE DISEÑO

Define y documenta en `docs/SISTEMA_DISENO.md` una **identidad visual propia** para una herramienta de investigación UX/usabilidad: sobria, legible, profesional, con carácter. Evita el look genérico de "azul + gris + tarjetas blancas". Criterios:

1. **Paleta nueva y semántica** (propón una que mejore la experiencia de los usuarios)
   - un color de marca principal y uno de acento secundario, con escalas de 50–900;
   - **un color de acento reservado exclusivamente para todo lo generado por IA** (Copiloto, sugerencias, borradores), para distinguirlo del contenido humano;
   - colores semánticos de éxito/advertencia/error/información y **escala de severidad** (crítica/alta/media/baja) consistente en Hallazgos, Observaciones, Dashboard y Backlog;
   - neutros con un matiz coherente con la marca (no gris puro), superficies en 3 niveles de elevación.
2. **Tipografía:** una fuente de títulos con personalidad + una de texto muy legible (+ monoespaciada para códigos/IDs/horas), cargadas con `font-display: swap` desde Google Fonts o `@fontsource` (prefiere autoalojar con `@fontsource` si instalar paquetes es viable; si no, `<link>` con preconnect). Escala tipográfica modular y jerarquía clara de títulos, subtítulos, etiquetas y datos.
3. **Forma y ritmo:** sistema de espaciado en base 4/8 px, radios consistentes, bordes/sombras sutiles en 3 niveles, densidad cómoda para tablas y formularios largos.
4. **Modo oscuro** completo: `prefers-color-scheme` + conmutador manual persistido (con `try/catch` en `localStorage`), todos los tokens redefinidos para ambos temas; sin colores sueltos que rompan el tema.
5. **Movimiento:** transiciones breves y útiles (hover, foco, apertura de modales/drawers, carga), respetando `prefers-reduced-motion`.
6. **Gráficos** (`PieChart` y barras de progreso): paleta categórica distinguible para daltonismo, con etiquetas/patrones que no dependan solo del color.

## PLAN DE TRABAJO

### Fase 1 — Auditoría y sistema de diseño
- Inventario interno de colores hardcodeados (`grep` de `#hex`, `rgb(`, `rgba(`, `hsl(` fuera de `:root`) y de estilos inline; anota el alcance en `docs/DECISIONES_DISENO.md`.
- Reescribe los **tokens** en `:root` (y el tema oscuro) con la nueva identidad: color, tipografía, espaciado, radios, sombras, z-index, transiciones. Mantén los **nombres actuales de variables** cuando sea posible (así el resto del CSS se re-tematiza solo) y añade los nuevos (`--color-ai*`, `--severity-*`, `--space-*`, `--radius-*`, `--shadow-*`).
- Documenta en `docs/SISTEMA_DISENO.md`: paleta con contrastes calculados, tipografía, espaciado, componentes y reglas de uso.

### Fase 2 — Migración de estilos
- Reemplaza **todos** los colores sueltos del CSS por tokens. Convierte los estilos inline (`style={{…}}`) a clases en CSS (o a clases utilitarias con tokens) salvo valores verdaderamente dinámicos (anchos de barras de progreso, posiciones); para esos usa **variables CSS inline** (`style={{ '--value': pct }}`).
- Organiza `index.css` sin cambiar el comportamiento: separa en archivos importados desde `main.tsx` (`styles/tokens.css`, `base.css`, `layout.css`, `components.css`, `pages/*.css`, `print.css`), conservando el orden de cascada. **Conserva intactos los estilos de impresión** usados por "Imprimir PDF" del Sprint Backlog y verifica que sigan funcionando.
- Elimina CSS muerto (`App.css` de la plantilla, clases sin uso) solo si confirmas que no se referencia.

### Fase 3 — Rediseño por componente y pantalla
Rediseña con la nueva identidad, en este orden, cuidando jerarquía visual, agrupación (Gestalt), consistencia y estados:
1. **Layout:** barra lateral (fases con indicador de progreso), cabecera, selector de plan, breadcrumbs/título de página, versión móvil con menú colapsable.
2. **Componentes base:** botones (primario/secundario/terciario/peligro, tamaños, `:hover`, `:focus-visible`, `:disabled`, loading), inputs/selects/textarea/checkbox/radio, etiquetas y ayudas, **mensajes de error y éxito**, badges (severidad, estado, prioridad), tarjetas, tablas (cabecera fija, filas cebra suaves, ordenación visible), tabs, pestañas, tooltips, toasts, modales y drawers, estados vacíos, skeletons de carga, paginación.
3. **Dashboard:** tarjetas KPI, gráfico de pastel, barras de progreso por fase, accesos rápidos.
4. **Módulo de evaluaciones:** Planes, Guion, Participantes, Tareas, Sesiones, `SessionRunner` (pantalla de uso en vivo: legible, con temporizador y acciones grandes), Observaciones.
5. **Análisis:** Hallazgos, Acciones de Mejora, Sprint Backlog (columnas, historias, tareas), Accesibilidad.
6. **`AiCopilot`:** panel/chat con la identidad de "IA" (acento exclusivo), burbujas diferenciadas, estados reposo/cargando/error claros, entrada accesible.
7. Cualquier página nueva que ya exista en la rama (por ejemplo SCRUM) debe adoptar el mismo sistema sin cambios funcionales.

### Fase 4 — Accesibilidad y responsive (obligatorio)
- **Contraste WCAG AA** en todos los pares texto/fondo, bordes de inputs y componentes interactivos (4.5:1 texto, 3:1 UI y texto grande), en **ambos temas**. Calcula los ratios con un script y guarda el reporte en `docs/evidencia/contrastes.md`.
- Foco visible y consistente (`:focus-visible`) en todos los controles; tamaño mínimo táctil 44×44 px en móvil.
- La información nunca depende solo del color (íconos/etiquetas en severidad y estados).
- Responsive de 360 px a 1920 px sin scroll horizontal de página; tablas con scroll contenido o vista en tarjetas en móvil.
- `prefers-reduced-motion` y `prefers-contrast` respetados; `aria-live` en toasts y cargas de IA; no elimines `aria-*`, `role` ni `label` existentes.
- Pasa Lighthouse (Accesibilidad ≥ 95 en Dashboard, Observaciones y Sprint Backlog) si Chromium está disponible; si no, documenta que no se pudo medir.

## REGLAS

- **No cambies funcionalidad:** rutas, props públicas, llamadas a `api/`, contextos, lógica y textos de negocio quedan igual. Solo se permiten cambios mínimos de marcado (clases, contenedores, atributos de accesibilidad) necesarios para el estilo.
- No agregues librerías de UI ni Tailwind. Solo se permiten tipografías (preferible `@fontsource`) y, si hace falta, una utilidad pequeña para el tema; justifica cualquier dependencia nueva.
- Reutiliza `lucide-react` para íconos.
- No inventes datos ni resultados de pruebas con usuarios.
- Textos de interfaz y documentación en español. No incluyas claves ni secretos.
