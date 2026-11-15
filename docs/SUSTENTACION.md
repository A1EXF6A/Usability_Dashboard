# Guía Estratégica de Sustentación Oral y Defensa Técnica

**Universidad Técnica de Ambato**  
**Facultad de Ingeniería en Sistemas, Electrónica e Industrial**  
**Carrera de Software — Cátedra de Interacción Hombre-Computador (Nivel 5-A)**  
**Docente:** Ing. José Caiza, Mg.  
**Tiempo Objetivo de Exposición:** 12 a 15 minutos (+ 5 minutos de preguntas y respuestas)  
**Fecha:** Noviembre 2026 | **Versión:** 2.0  

---

## 1. Estructura Recomendada de Diapositivas (10 Slides)

| Diapositiva | Título / Tema | Tiempo Sugerido | Mensaje Clave a Transmitir |
|---|---|---|---|
| **Slide 1** | **Carátula Institucional y Tema** | 45 seg | Proyecto integrado: Evaluación formal CIF, Rediseño accesible WCAG 2.2 y Módulo SCRUM con cociente $BV/SP$. |
| **Slide 2** | **El Problema Diagnosticado** | 1.5 min | Interfaz original con baja tasa de éxito (58.3%), contrastes deficientes (WAVE), falta de visibilidad del estado y errores crípticos. |
| **Slide 3** | **Fundamentación Teórica e IHC** | 1.5 min | 10 Heurísticas de Nielsen, Pautas WCAG 2.2 AA, Ley de Fitts ($44\times44\text{px}$), Ley de Gestalt y Estándar ISO/IEC 25062 CIF. |
| **Slide 4** | **Metodología y Prototipado** | 1.5 min | Ciclo DCU iterativo (Lo-Fi $\rightarrow$ Mid-Fi $\rightarrow$ Hi-Fi) y Design System con tokens certificados. |
| **Slide 5** | **Resultados Cuantitativos y Métricas** | 2.0 min | Gráficos Antes vs Después: Tasa de éxito al 92.5%, tiempo medio a 48s, SUS a 88.5/100 y Lighthouse a 98/100. |
| **Slide 6** | **Módulo SCRUM Relacional y Matriz Excel** | 2.0 min | Digitalización de la matriz de planificación: Priorización por $BV/SP$, capacidad de 160h, Kanban accesible, TNP y Daily. |
| **Slide 7** | **Asistente de IA Heurístico y Resiliencia** | 1.5 min | Análisis de observaciones con prompt senior UX, firewall contra formato markdown y fallback determinista garantizado. |
| **Slide 8** | **Demostración en Vivo (Live Demo)** | 3.5 min | Flujo en tiempo real: Observación $\rightarrow$ IA $\rightarrow$ Backlog $BV/SP$ $\rightarrow$ Kanban $\rightarrow$ Reporte PDF. |
| **Slide 9** | **Arquitectura de Software y Clean Code** | 1.0 min | Clean Architecture en .NET 10, Entity Framework Core con PostgreSQL, React 19 + TypeScript y Docker. |
| **Slide 10** | **Conclusiones y Agradecimiento** | 45 seg | Cierre metodológico: La usabilidad y la accesibilidad como factores medibles de éxito en la ingeniería de software. |

---

## 2. Guión de Defensa Oral Paso a Paso (Speech)

### Introducción (Minuto 0:00 - 1:30)
> *"Buenos días, estimado Ing. José Caiza y compañeros. Hoy les presentamos la culminación de nuestro proyecto integrado de Interacción Hombre-Computador: **Usability Test Dashboard 2.0**.  
> El desafío central que abordamos no fue simplemente cambiar colores o fuentes en una pantalla, sino resolver un problema endémico en la industria: **¿cómo transformar los hallazgos de fricción y las barreras de accesibilidad detectadas en pruebas de usabilidad en trabajo técnico concreto y priorizado para un equipo de desarrollo ágil?**  
> Para responder a esto, articulamos los estándares internacionales de usabilidad **ISO/IEC 25062 CIF**, las directrices de accesibilidad **WCAG 2.2 nivel AA**, la metodología **SCRUM con priorización por Cociente de Decisión ($BV/SP$)** y un asistente inteligente de análisis heurístico."*

### El Diagnóstico y Marco Teórico (Minuto 1:30 - 3:30)
> *"Al auditar la interfaz base mediante las 10 heurísticas de Nielsen y herramientas como WAVE y Stark, identificamos problemas graves: la tasa de éxito de los usuarios era de apenas 58.3%, los tiempos de tarea superaban los 110 segundos, no había retroalimentación de estado durante guardados (violando la Heurística 1) y los textos tenían contrastes inferiores a 2.5:1. Además, se eliminó el foco por teclado, excluyendo a usuarios con discapacidad.  
> Aplicamos la Ley de Fitts para garantizar que todo objetivo táctil mida al menos $44\times44\text{px}$, establecimos un Design System con paleta semántica de alto contraste y diseñamos un flujo de navegación claro que reduce la carga cognitiva."*

### Módulo SCRUM y Cociente de Decisión (Minuto 3:30 - 5:30)
> *"Uno de los mayores aportes del proyecto es la digitalización integral de la **Matriz de Planificación de Usabilidad (v1.0)** en una arquitectura relacional.  
> En lugar de priorizar historias de usuario por capricho o intuición, implementamos el **Cociente de Decisión**:
> $$\text{Cociente} = \frac{\text{Business Value (BV)}}{\text{Story Points (SP)}}$$
> Donde el Valor de Negocio (1-100) mide el beneficio UX para el usuario, y los Puntos de Historia (Fibonacci) representan el esfuerzo técnico. Aquellas historias con mayor cociente ofrecen el máximo retorno de usabilidad y son programadas primero en los Sprints.  
> El módulo incluye control de capacidad (160 horas por Sprint), Tablero Kanban accesible (drag-and-drop y teclado), registro de Tareas No Planificadas (TNP), Daily logs, Retrospectivas y exportación directa a Excel con codificación UTF-8 BOM."*

### Asistencia Heurística con IA y Resiliencia (Minuto 5:30 - 7:00)
> *"Para asistir al evaluador de usabilidad, integramos un servicio de inteligencia artificial con Google Gemini. Su objetivo no es reemplazar el juicio humano, sino acelerar la clasificación heurística de observaciones cualitativas y redactar borradores de Historias de Usuario bajo el formato 'Como... quiero... para...'.  
> Diseñamos una arquitectura defensiva: un firewall limpia cualquier residuo de formato en la respuesta, y si la API externa no responde o no hay credenciales, entra en acción un **fallback determinista** marcado como 'mock', garantizando que el sistema jamás falle durante la evaluación."*

### Resultados y Conclusión (Minuto 7:00 - 8:30)
> *"Los números avalan nuestro trabajo: elevamos la tasa de éxito al 92.5%, redujimos los tiempos en un 57%, obtuvimos 98/100 en Lighthouse de accesibilidad y alcanzamos 88.5 puntos en la escala SUS (clasificación Excelente, Grado A).  
> Pasemos de inmediato a la demostración en vivo de la plataforma."*

---

## 3. Guión de la Demostración en Vivo (Live Demo - 4 Minutos de Oro)

1. **Minuto 1: Dashboard y Plan Activo**:
   - Mostrar el cambio dinámico de planes y el estado de progreso en las fases 1, 2 y 3.
   - Demostrar el *Skip Link* para accesibilidad por teclado (`Tab` inicial).
2. **Minuto 2: Observaciones y Asistente de IA**:
   - Abrir la pantalla de Observaciones y pulsar el botón **"Asistente Heurístico IA"**.
   - Mostrar la barra de carga accesible con `aria-live` y el desglose de severidades y heurísticas sugeridas.
   - Seleccionar una historia de usuario sugerida con la etiqueta *"Sugerido por IA"* y enviarla al Product Backlog.
3. **Minuto 3: Product Backlog y Módulo SCRUM**:
   - Entrar a **Product Backlog**: mostrar el cálculo instantáneo del **Cociente de Decisión ($BV/SP$)**.
   - Pulsar el botón **"Ordenar por Cociente (BV/SP)"** y explicar la priorización descendente.
   - Ir a **Planificación & Kanban**: mostrar la barra de capacidad (horas asignadas vs 160h).
   - Mover una tarjeta en el Tablero Kanban usando los botones de teclado `[Mover ->]` y también con drag-and-drop.
   - Mostrar las pestañas de **TNP (Tareas No Planificadas)** y **Daily Log**.
4. **Minuto 4: Comparativa y Reporte Formal PDF**:
   - Ir a **Rediseño Comparativo**: mostrar la vista lado a lado Antes vs Después con métricas de Nielsen y WCAG.
   - Ir a **Reporte Formal PDF**: pulsar el botón **"Imprimir / Guardar en PDF"** mostrando la hoja ejecutiva estilizada lista para firma.

---

## 4. Preguntas Frecuentes Difíciles del Docente y Respuestas Modelo

### Pregunta 1: *"¿Por qué afirman que su Tablero Kanban cumple con WCAG 2.2 si el drag-and-drop suele ser inaccesible?"*
> **Respuesta:**  
> *"Excelente pregunta, Ingeniero. El criterio de éxito **2.1.1 de WCAG (Teclado)** estipula que cualquier acción realizable con puntero debe poder ejecutarse mediante teclado. Por ello, además del arrastrar y soltar con HTML5, cada tarjeta del Kanban incluye controles alternativos accesibles con botones `[<- Mover]` y `[Mover ->]`. Un usuario con discapacidad motriz puede enfocar la tarjeta con `Tab` y pulsar `Enter` o `Espacio` para avanzar o retroceder la tarea de columna sin requerir ratón."*

### Pregunta 2: *"¿Cómo calcularon exactamente el Cociente de Decisión ($BV/SP$) y qué ocurre si un desarrollador infla los Puntos de Historia?"*
> **Respuesta:**  
> *"El Cociente se calcula como la división estricta: $BV / SP$. El Business Value ($BV$) lo define el Product Owner en conjunto con el Evaluador UX basándose en la severidad del hallazgo (un problema crítico recibe entre 80 y 100). Los Story Points ($SP$) se estiman en equipo mediante Planning Poker con la sucesión de Fibonacci ($1, 2, 3, 5, 8, 13$).  
> Si se inflan los SP, el cociente disminuye automáticamente, lo que penaliza la prioridad de la historia en el backlog; esto incentiva al equipo a dividir historias complejas en historias más pequeñas y manejables, lo cual es la mejor práctica de SCRUM."*

### Pregunta 3: *"¿Qué pasa si en plena sustentación o en producción se corta el internet o falla la API de Google Gemini?"*
> **Respuesta:**  
> *"Diseñamos la arquitectura bajo el principio de **degradación elegante y alta disponibilidad**. El servicio `AiAnalysisService` en .NET captura cualquier error de red, timeout o clave faltante e inmediatamente activa un **fallback determinista estructurado** basado en palabras clave y heurísticas de Nielsen. La UI recibe exactamente el mismo contrato JSON pero con la bandera `'source': 'mock'`, garantizando que el usuario nunca vea una pantalla de error ni se interrumpa el flujo de trabajo."*

### Pregunta 4: *"¿Cómo garantizan que la exportación de la matriz no tenga problemas de caracteres al abrirse en Microsoft Excel?"*
> **Respuesta:**  
> *"El controlador `ScrumController` inyecta en el flujo de bytes el **BOM UTF-8 (Byte Order Mark: `\uFEFF`)** al inicio del archivo CSV generado. Esto le indica explícitamente a Microsoft Excel en sistemas Windows que interprete el archivo bajo codificación UTF-8, resolviendo por completo los problemas comunes de visualización de tildes, la letra 'ñ' y caracteres especiales en español."*
