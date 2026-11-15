# Registro de Decisiones de Diseño (ADR de Frontend) — Usability Test Dashboard 2.0

**Proyecto:** Usability Test Dashboard 2.0  
**Área:** Interacción Humano-Computador (IHC) & Diseño Centrado en el Usuario (DCU)  
**Fecha:** Noviembre 2026  
**Estado:** Aprobado / Implementado  

---

## 1. Inventario y Auditoría del Estado Inicial

Antes del rediseño, se realizó una auditoría estática exhaustiva de los archivos de frontend en `frontend_beta/src`:

### 1.1 Estilos en línea (`style={{...}}`)
Se detectaron **356 instancias de estilos en línea** repartidas en los siguientes 15 componentes y páginas:

| Archivo / Componente | Ocurrencias Inline | Tipo de Uso Principal |
| :--- | :---: | :--- |
| `src/pages/Accessibility.tsx` | 67 | Barras de cumplimiento WCAG, badges de nivel, colores de severidad |
| `src/pages/SessionRunner.tsx` | 45 | Temporizadores, layout de métricas en vivo, botones de estado |
| `src/pages/SprintBacklog.tsx` | 40 | Columnas de tablero Scrum, badges de story points, avatares |
| `src/components/AiCopilot.tsx` | 36 | Burbujas de chat, listas de selección de tareas, tarjetas de acción |
| `src/pages/ImprovementActions.tsx` | 24 | Matriz de impacto/esfuerzo, badges de prioridad |
| `src/pages/Findings.tsx` | 22 | Tarjetas de hallazgo, niveles de severidad |
| `src/pages/Dashboard.tsx` | 17 | Indicadores KPI, leyendas de distribución de hallazgos |
| `src/pages/Tasks.tsx` | 17 | Métricas esperadas, badges de escenario |
| `src/pages/TestPlans.tsx` | 21 | Formulario modal, tarjetas de plan de pruebas |
| `src/pages/ModeratorScript.tsx` | 16 | Pasos del guion, bloques de notas para moderador |
| `src/pages/Observations.tsx` | 20 | Categorías heurísticas de Nielsen, marcas de tiempo |
| `src/pages/Participants.tsx` | 11 | Fichas demográficas, tags de rol |
| `src/pages/TestSessions.tsx` | 11 | Calendario de trabajo de campo, estados de sesión |
| `src/components/Layout.tsx` | 6 | Anchos mínimos y colores de SVG |
| `src/components/PlanSelector.tsx` | 3 | Contenedores de selección activa |
| **Total Global** | **356** | **Migrados a clases CSS con design tokens** |

### 1.2 Colores Hardcodeados fuera de `:root`
- **107 valores hexadecimales directos** y **134 funciones `rgb()/rgba()` hardcodeadas** en `src/index.css`.
- **15 códigos de color hexadecimales** insertados directamente en componentes `.tsx` (ej. `#ef4444`, `#3b82f6`, `#10b981`, `#6366f1`, `#7c3aed`).
- **Problema de UX/UI:** La proliferación de valores arbitrarios provocaba inconsistencia cromática, falta de contraste en algunos fondos y la imposibilidad de soportar Modo Oscuro sin rotura visual.

---

## 2. Dirección Conceptual y Filosofía Visual

Para una herramienta especializada en **investigación de usabilidad y pruebas con personas**, el software no debe verse como un panel administrativo genérico ni como un clon de Bootstrap/Tailwind con azules estándar.

### Principios Rectores:
1. **Rigor Metodológico y Calma Visual:** Una interfaz para observación y análisis de métricas (SUS, tiempos, errores, tasa de éxito) requiere fondos neutros matizados, tipografía nítida y jerarquía clara que reduzca la fatiga cognitiva de moderadores e investigadores.
2. **Distinción Ontológica Hombre-Máquina:** El contenido humano (observaciones directas del moderador, citas del participante, decisiones de diseño) debe diferenciarse a simple vista del contenido asistido o generado por Inteligencia Artificial (Copiloto, sugerencias de tareas, categorización heurística automática).
3. **Ergonomía e Inclusividad (WCAG 2.2 AA):** La interfaz no asume capacidades visuales perfectas ni dispositivos de entrada exclusivos. Se garantiza contraste mínimo de 4.5:1 en texto normal, focos `:focus-visible` omnipresentes y áreas táctiles mínimas de 44×44 px.

---

## 3. Decisiones de Identidad Visual

### 3.1 Paleta de Color y Semántica

| Rol | Color / Matiz | Token Principal | Justificación |
| :--- | :--- | :--- | :--- |
| **Marca Primaria** | Deep Oceanic Teal (`#0f766e` / `#0d9488`) | `--color-primary` | Evoca rigor científico, concentración y balance orgánico/técnico; rompe el estereotipo del "azul SaaS corporativo". |
| **Acento Secundario** | Warm Terracotta / Amber (`#ea580c` / `#d97706`) | `--color-secondary` | Representa la dimensión humana y la calidez del usuario participante; se usa para llamadas a la acción clave e hitos de avance. |
| **Acento Exclusivo de IA** | Electric Amethyst Violet (`#7c3aed` / `#8b5cf6`) | `--color-ai-*` | **Reservado estrictamente** para el Copiloto IA, sugerencias algorítmicas, badges generados y estados de procesamiento inteligente. El usuario nunca confunde un dato empírico con una inferencia del modelo. |
| **Severidad: Crítica** | Crimson Rose (`#be123c` / light `#ffe4e6`) | `--severity-critical-*` | Problemas bloqueantes que impiden completar la tarea (catástrofes de usabilidad). |
| **Severidad: Alta** | Vermilion / Orange (`#c2410c` / light `#ffedd5`) | `--severity-high-*` | Dificultades mayores con frustración evidente del usuario. |
| **Severidad: Media** | Amber Ochre (`#b45309` / light `#fef3c7`) | `--severity-medium-*` | Problemas menores o desvíos con recuperación autónoma. |
| **Severidad: Baja** | Slate Cyan (`#0369a1` / light `#e0f2fe`) | `--severity-low-*` | Sugerencias cosméticas o micro-fricciones. |
| **Neutros Matizados** | Pizarra con matiz frío | `--neutral-50…900` | No gris puro plano (#808080); neutros que armonizan con la paleta Teal y reducen el deslumbramiento. |

### 3.2 Tipografía

Se adoptó una combinación armónica de 3 fuentes cargadas con `font-display: swap` y preconnect:
- **Títulos y Encabezados:** `Outfit` (sans-serif geométrica con terminaciones humanistas y alta personalidad). Da carácter a la suite de investigación.
- **Cuerpo y Controles de Interfaz:** `Plus Jakarta Sans` (diseñada específicamente para pantallas modernas, legibilidad sobresaliente en densidades de datos altas).
- **Códigos, Tiempos e IDs:** `JetBrains Mono` (monoespacio claro para timestamps de video, IDs de historias de usuario `US-01`, tareas `TK-04` y métricas de tiempo).

### 3.3 Superficies y Modo Oscuro
- **Superficies en 3 niveles:**
  - Nivel 0 (Página): `--surface-page` (`#f4f6f8` claro / `#090d16` oscuro).
  - Nivel 1 (Tarjetas/Paneles): `--surface-card` (`#ffffff` claro / `#111827` oscuro).
  - Nivel 2 (Modales/Elevados): `--surface-elevated` (`#ffffff` claro / `#1f293d` oscuro).
- **Mecanismo de Conmutación:**
  - Persistencia bajo clave `'utd_theme'` en `localStorage` con captura de excepciones (`try/catch`).
  - Detección automática de preferencia de sistema operativo mediante `@media (prefers-color-scheme: dark)`.
  - Conmutador manual accesible con teclado en la cabecera principal (`Layout.tsx`).

---

## 4. Reestructuración de la Hoja de Estilos (Fase 2)

El archivo monolítico `src/index.css` (~6.950 líneas) se organiza en módulos claros dentro de `src/styles/` sin alterar el orden de especificidad en cascada:

```
src/
├── styles/
│   ├── tokens.css       # Tokens :root (claro/oscuro, escalas, radios, sombras, IA)
│   ├── base.css         # Reset, body, tipografía, WCAG, reducciones de movimiento
│   ├── layout.css       # Shell, sidebar con fases, cabecera, migas de pan, responsive
│   ├── components.css   # Botones, inputs, badges, KPI cards, toasts, modales, tablas
│   ├── pages.css        # Estilos específicos de cada vista (Dashboard, Sesiones, etc.)
│   ├── ai-copilot.css   # Panel de IA, burbujas de diálogo, sugerencias, insignias IA
│   └── print.css        # Reglas intactas @media print para exportación de Sprint Backlog
├── index.css            # Archivo agregador central con cascada ordenada
└── App.css              # Depreciado (limpieza de residuos de la plantilla de Vite)
```

---

## 5. Garantías de Accesibilidad (WCAG 2.2 AA)

1. **Ratios de Contraste Calculados:** Todos los pares de texto/fondo superan 4.5:1 (texto normal) y 3:1 (UI y texto grande). Documentados con cálculo algorítmico en `docs/evidencia/contrastes.md`.
2. **Navegación por Teclado:** Se mantiene el *Skip link* inicial (`#main-content`), indicadores de foco visible `:focus-visible` con anillo teal/violeta de 3px y offset de 2px, y anulación de trampas de teclado.
3. **Áreas Táctiles:** Controles, pestañas y botones móviles con tamaño mínimo garantizado de 44×44 px (`--touch-target-min`).
4. **Independencia del Color:** Ningún estado o severidad se comunica únicamente por color; se acompañan siempre de íconos vectoriales (`lucide-react`) y etiquetas de texto explícitas.
5. **Preferencia de Movimiento:** Regla global `@media (prefers-reduced-motion: reduce)` que neutraliza transiciones y animaciones para usuarios con trastornos vestibulares.
