# Sistema de Diseño — Usability Test Dashboard 2.0 (Design System & Guidelines)

**Versión:** 2.0  
**Fecha:** Noviembre 2026  
**Contexto:** Interacción Humano-Computador (IHC) · Diseño Centrado en el Usuario (DCU)  
**Estándar de Accesibilidad:** WCAG 2.2 Nivel AA / AAA  

---

## 1. Filosofía e Identidad Visual

*Usability Test Dashboard 2.0* es una suite de trabajo especializada en la planificación, ejecución y análisis de pruebas de usabilidad y accesibilidad con usuarios reales.

Su estética visual rechaza las plantillas SaaS genéricas ("azul genérico + blanco + sombras planas") para abrazar una identidad propia: **metódica, científica, cálida y de alta legibilidad**.

### Principios Fundamentales:
1. **Claridad sobre Ruido:** Jerarquías tipográficas contundentes que permiten escanear métricas críticas (SUS, tasa de error, tiempo en tarea) en milisegundos.
2. **Distinción Ontológica Hombre vs. IA:** El contenido emanado del Copiloto IA (sugerencias, borradores, heurísticas asistidas) posee un lenguaje visual y cromático propio (**Electric Violet**), impidiendo que se confunda con observaciones empíricas humanas.
3. **Ergonomía Inclusiva:** Todos los contrastes cumplen WCAG 2.2 AA (mínimo 4.5:1 texto, 3:1 interfaz). Los estados interactivos tienen focos visuales claros (`:focus-visible`) y áreas táctiles de al menos 44×44 px.

---

## 2. Paleta Cromática y Tokens Semánticos

### 2.1 Marca Primaria — Deep Oceanic Teal
Simboliza rigor metodológico, calma y precisión analítica.

| Token | Hex | Uso en UI |
| :--- | :---: | :--- |
| `--color-primary-50` | `#f0fdfa` | Fondos de banners y acentos suaves activos |
| `--color-primary-100` | `#ccfbf1` | Estados de hover suaves y contenedores destacados |
| `--color-primary-200` | `#99f6e4` | Bordes sutiles de selección activa |
| `--color-primary-300` | `#5eead4` | Indicadores de foco claro |
| `--color-primary-400` | `#2dd4bf` | Acentos en modo oscuro (contraste 9.5:1) |
| `--color-primary-500` | `#14b8a6` | Indicadores de progreso y barras |
| `--color-primary-600` | `#0d9488` | Botones de acción secundaria y enlaces |
| `--color-primary` (700) | `#0f766e` | **Color base de marca**, botones primarios (5.47:1) |
| `--color-primary-hover` (800) | `#115e59` | Hover de botones primarios (7.58:1) |
| `--color-primary-active` (900) | `#134e4a` | Estado presionado / active |

### 2.2 Acento Secundario — Warm Terracotta / Amber
Evoca el factor humano, la empatía y la vivencia del participante durante la prueba.

| Token | Hex | Uso en UI |
| :--- | :---: | :--- |
| `--color-secondary-50` | `#fff7ed` | Fondo de tags de participante |
| `--color-secondary-100` | `#ffedd5` | Contenedores de notas de moderador |
| `--color-secondary-500` | `#f97316` | Acento gráfico en gráficos e infografías |
| `--color-secondary-600` | `#ea580c` | Botón de acento destacado |
| `--color-secondary-700` | `#c2410c` | **Color base acento** (contraste 5.18:1 sobre blanco) |
| `--color-secondary-800` | `#9a3412` | Hover de acento |

### 2.3 Acento Exclusivo de IA — Electric Amethyst Violet
**Regla de uso inquebrantable:** Este color y sus derivados (`--color-ai-*`) están **reservados con exclusividad** para el Copiloto IA, sugerencias algorítmicas de tareas, síntesis automáticas de hallazgos y badges de asistencia inteligente. Jamás se utiliza para datos ingresados manualmente por el investigador.

| Token | Hex | Uso en UI |
| :--- | :---: | :--- |
| `--color-ai-50` | `#f5f3ff` | Fondo de sugerencia de IA en chat y tablas |
| `--color-ai-100` | `#ede9fe` | Fondo de burbujas del Copiloto |
| `--color-ai-200` | `#ddd6fe` | Bordes de paneles con inferencias IA |
| `--color-ai-400` | `#a78bfa` | Acento en modo oscuro para sugerencias |
| `--color-ai-500` | `#8b5cf6` | Botón flotante Copiloto IA |
| `--color-ai-600` | `#7c3aed` | Botón de inserción automática (5.70:1) |
| `--color-ai-700` | `#6d28d9` | Texto destacado y títulos del Copiloto (6.48:1) |
| `--color-ai-gradient` | `linear-gradient(135deg, #7c3aed, #a855f7 50%, #6366f1)` | Cabecera del Copiloto y halo de activación |

### 2.4 Escala de Severidad de Usabilidad (Consistente en toda la aplicación)

| Nivel | Rol en Pruebas | Texto / Borde | Fondo Claro | Fondo Oscuro |
| :--- | :--- | :---: | :---: | :---: |
| **Crítica** | Bloqueante / Catástrofe | `#be123c` | `#ffe4e6` | `#4c0519` (texto `#fda4af`) |
| **Alta** | Dificultad mayor con frustración | `#c2410c` | `#ffedd5` | `#431407` (texto `#fdba74`) |
| **Media** | Fricción con recuperación | `#b45309` | `#fef3c7` | `#422006` (texto `#fde047`) |
| **Baja** | Cosmética / Micro-fricción | `#0369a1` | `#e0f2fe` | `#082f49` (texto `#7dd3fc`) |

---

## 3. Tipografía

| Uso | Familia | Pesos | Justificación |
| :--- | :--- | :---: | :--- |
| **Títulos / Display** | `Outfit`, system-ui, sans-serif | 600, 700, 800 | Distintiva, geométrica, aporta solidez editorial sin rigidez corporativa. |
| **Cuerpo / Textos** | `Plus Jakarta Sans`, sans-serif | 400, 500, 600 | Extraordinaria legibilidad en tamaños pequeños (11–14px) y alta densidad de datos. |
| **Códigos / Métricas** | `JetBrains Mono`, monospace | 400, 500 | Ancho fijo para temporizadores, IDs de historia (`US-02`), tareas y logs de sesión. |

### Escala Modular:
- `--font-size-xs`: `0.75rem` (12px) — Badges, metadatos, captions.
- `--font-size-sm`: `0.875rem` (14px) — Formularios, textos secundarios, filas de tablas.
- `--font-size-base`: `1rem` (16px) — Párrafos, cuerpo de observación, botones principales.
- `--font-size-lg`: `1.125rem` (18px) — Subtítulos de sección, modales.
- `--font-size-xl`: `1.25rem` (20px) — Títulos de tarjetas y paneles.
- `--font-size-2xl`: `1.5rem` (24px) — Títulos de página.
- `--font-size-3xl`: `1.875rem` (30px) — Valores numéricos de KPI cards y temporizador.

---

## 4. Forma, Superficies y Modo Oscuro

### 4.1 Sistema de Elevación y Superficies

```
Nivel 0: Fondo de página   (--surface-page)      → #f4f6f8 (Claro) / #090d16 (Oscuro)
Nivel 1: Tarjetas/Tablas   (--surface-card)      → #ffffff (Claro) / #111827 (Oscuro)
Nivel 2: Modales/Flotantes (--surface-elevated)  → #ffffff (Claro) / #1f293d (Oscuro)
Superficie traslúcida:     (--surface-panel)     → rgba(255,255,255,0.92) / rgba(17,24,39,0.88)
```

### 4.2 Radios de Borde Consistentes
- `--radius-sm`: `6px` (tags pequeños, checkboxes, badges compactos)
- `--radius-md`: `10px` (inputs, botones, celdas interactivas)
- `--radius-lg`: `14px` (tarjetas, paneles estándar)
- `--radius-xl`: `20px` (modales grandes, drawer del Copiloto IA)
- `--radius-full`: `9999px` (pills, avatares, badges redondeados)

### 4.3 Sombras Suaves (3 Niveles)
- `--shadow-sm`: `0 1px 3px rgba(15, 23, 42, 0.05)`
- `--shadow-md`: `0 6px 16px rgba(15, 23, 42, 0.07)`
- `--shadow-lg`: `0 16px 36px rgba(15, 23, 42, 0.10)`
- `--shadow-focus`: `0 0 0 3px rgba(15, 118, 110, 0.28)`
- `--shadow-ai-focus`: `0 0 0 3px rgba(124, 58, 237, 0.30)`

---

## 5. Gráficos Accesibles (PieChart & Barras)

1. **Paleta categórica segura para daltonismo:**
   - Categoría Crítica: `#be123c` (Crimson Rose)
   - Categoría Moderada: `#0284c7` (Sky Blue)
   - Categoría Otros / Leve: `#059669` (Emerald Green)
2. **Independencia del Color:** Todo segmento de gráfico circular o barra de progreso incluye:
   - Leyenda explícita con nombre y valor numérico.
   - Atributos semánticos accesibles (`role="img"`, `aria-label`).
   - Distinción por patrón visual o posición tabular redundante.

---

## 6. Movimiento y Estados Interactivos

1. **Transiciones:** Cortas y útiles (150ms–250ms) con curva `cubic-bezier(0.4, 0, 0.2, 1)`.
2. **Respeto a `prefers-reduced-motion`:**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
3. **Foco Accesible (`:focus-visible`):**
   - Anillo visible de 2px con offset de 2px en color primario (`--color-primary`) o IA (`--color-ai-500`).
   - Jamás se oculta el contorno de foco sin proveer un reemplazo de alto contraste.
