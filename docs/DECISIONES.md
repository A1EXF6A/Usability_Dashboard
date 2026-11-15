# Registro de Decisiones de Arquitectura (ADR - Architectural Decision Records)

**Universidad Técnica de Ambato**  
**Facultad de Ingeniería en Sistemas, Electrónica e Industrial**  
**Carrera de Software — Cátedra de Interacción Hombre-Computador (Nivel 5-A)**  
**Docente:** Ing. José Caiza, Mg.  
**Fecha:** Noviembre 2026 | **Versión:** 2.0  

---

## Índice de Decisiones

* [ADR-01: Adopción de Clean Architecture en .NET 10](#adr-01-adopción-de-clean-architecture-en-net-10)
* [ADR-02: Digitalización Relacional de la Matriz de Planificación SCRUM](#adr-02-digitalización-relacional-de-la-matriz-de-planificación-scrum)
* [ADR-03: Priorización del Product Backlog mediante el Cociente de Decisión (BV/SP)](#adr-03-priorización-del-product-backlog-mediante-el-cociente-de-decisión-bvsp)
* [ADR-04: Tablero Kanban Accesible con Doble Modalidad (Drag & Drop + Teclado)](#adr-04-tablero-kanban-accesible-con-doble-modalidad-drag--drop--teclado)
* [ADR-05: Uso de IHttpClientFactory y Arquitectura Defensiva de IA con Fallback Determinista](#adr-05-uso-de-ihttpclientfactory-y-arquitectura-defensiva-de-ia-con-fallback-determinista)
* [ADR-06: Exportación de Matriz en CSV con Prefijo UTF-8 BOM para Microsoft Excel](#adr-06-exportación-de-matriz-en-csv-con-prefijo-utf-8-bom-para-microsoft-excel)
* [ADR-07: Reporte Formal Imprimible mediante CSS @media print Nativo](#adr-07-reporte-formal-imprimible-mediante-css-media-print-nativo)

---

### ADR-01: Adopción de Clean Architecture en .NET 10

* **Estado**: Aceptado.
* **Contexto**: La aplicación requería desacoplar las reglas de negocio y los cálculos de usabilidad/SCRUM de los frameworks de persistencia y de presentación.
* **Decisión**: Estructurar la solución en 4 capas concéntricas: `Domain` (Entidades e Interfaces núcleo), `Application` (Casos de uso, DTOs, Mappings y Lógica de Negocio), `Infrastructure` (Entity Framework Core, PostgreSQL, adaptadores HTTP) y `UsabilityDashboard_API` (Controladores Web API y configuración).
* **Consecuencias**:
  * *Positivas*: Alta testabilidad, mantenimiento sencillo, independencia de la base de datos y cumplimiento riguroso de principios SOLID.
  * *Compromisos*: Mayor cantidad de clases intermedias (DTOs y Mapeos), mitigado eficazmente mediante AutoMapper.

---

### ADR-02: Digitalización Relacional de la Matriz de Planificación SCRUM

* **Estado**: Aceptado.
* **Contexto**: El insumo original era una hoja de cálculo estática (`1.PJT_NOM_PJT_USABILIDAD_MATRIZ_PLANIFICACION_V1.0 (3).xlsx`) propensa a desincronización y sin trazabilidad con los hallazgos de usabilidad.
* **Decisión**: Modelar una estructura de base de datos relacional en PostgreSQL compuesta por `UserStory`, `Sprint`, `SprintTask`, `UnplannedTask` (TNP), `DailyLog` y `SprintRetrospective`, enlazando `UserStory.FindingId` a la tabla `Findings`.
* **Consecuencias**:
  * *Positivas*: Integridad referencial absoluta, control de capacidad en tiempo real (160h), trazabilidad total entre problemas UX y desarrollo ágil.
  * *Compromisos*: Requiere migraciones formales de EF Core y scripts de siembra SQL.

---

### ADR-03: Priorización del Product Backlog mediante el Cociente de Decisión (BV/SP)

* **Estado**: Aceptado.
* **Contexto**: El orden de desarrollo de mejoras de usabilidad suele decidirse de forma subjetiva, postergando mejoras críticas o invirtiendo esfuerzo en tareas cosméticas complejas.
* **Decisión**: Implementar el cálculo automático del **Cociente de Decisión**:
  $$\text{Cociente} = \frac{\text{Business Value (BV)}}{\text{Story Points (SP)}}$$
  Y dotar a la interfaz de un botón para ordenar automáticamente el backlog de forma descendente por este ratio.
* **Consecuencias**:
  * *Positivas*: Priorización matemática basada en el retorno de valor por unidad de esfuerzo técnico; cumplimiento directo de la rúbrica de la cátedra de IHC.

---

### ADR-04: Tablero Kanban Accesible con Doble Modalidad (Drag & Drop + Teclado)

* **Estado**: Aceptado.
* **Contexto**: Las implementaciones tradicionales de tableros Kanban basadas únicamente en arrastrar y soltar con el ratón violan el criterio **2.1.1 de WCAG 2.2 (Teclado)**, excluyendo a personas con discapacidad motriz.
* **Decisión**: Mantener el soporte de arrastre nativo con HTML5 Drag and Drop para usuarios de ratón, pero incorporar botones accesibles `[<- Mover]` y `[Mover ->]` en cada tarjeta con soporte para navegación secuencial con `Tab`, `Enter` y `Espacio`.
* **Consecuencias**:
  * *Positivas*: Cumplimiento estricto de WCAG 2.2 nivel AA; soporte para lectores de pantalla y tecnología adaptativa.

---

### ADR-05: Uso de IHttpClientFactory y Arquitectura Defensiva de IA con Fallback Determinista

* **Estado**: Aceptado.
* **Contexto**: El uso de instancias directas de `new HttpClient()` provoca agotamiento de sockets bajo carga concurrente. Además, depender ciegamente de una API externa de LLMs introduce riesgo de latencia, cuotas agotadas o alucinaciones de formato JSON.
* **Decisión**:
  1. Registrar `GeminiClient` utilizando `IHttpClientFactory` con políticas de timeout y encabezados centralizados.
  2. Implementar un limpiador de markdown defensivo en `AiAnalysisService`.
  3. Establecer un fallback determinista que devuelva historias y categorías basadas en palabras clave heurísticas bajo `"source": "mock"` cuando no haya API key o falle la conexión.
* **Consecuencias**:
  * *Positivas*: Eliminación de fugas de sockets; alta resiliencia y disponibilidad garantizada durante sustentaciones y pruebas sin conexión a internet.

---

### ADR-06: Exportación de Matriz en CSV con Prefijo UTF-8 BOM para Microsoft Excel

* **Estado**: Aceptado.
* **Contexto**: Microsoft Excel en entornos Windows asume por defecto la codificación ANSI o Windows-1252 al abrir archivos CSV planos, corrompiendo caracteres con tildes, la letra 'ñ' y símbolos técnicos en español.
* **Decisión**: Anteponer la marca de orden de bytes **UTF-8 BOM (`\uFEFF`)** al inicio del stream de respuesta en el endpoint `GET /api/scrum/sprints/{id}/export-matrix`.
* **Consecuencias**:
  * *Positivas*: Apertura transparente e inmediata en Microsoft Excel con acentos y caracteres ortográficos correctos.

---

### ADR-07: Reporte Formal Imprimible mediante CSS @media print Nativo

* **Estado**: Aceptado.
* **Contexto**: La inclusión de librerías pesadas de generación de PDF en el cliente (como `jspdf` o `html2pdf`) incrementa el peso del bundle JavaScript en más de 300 kB y suele provocar distorsiones en fuentes y tablas largas.
* **Decisión**: Diseñar la página `FormalReport.tsx` con reglas CSS especializadas para medios de impresión (`@media print`), ocultando la navegación, aplicando saltos de página limpios (`page-break-inside: avoid`) y disparando el motor nativo del navegador mediante `window.print()`.
* **Consecuencias**:
  * *Positivas*: Cero dependencias pesadas añadidas al bundle; fidelidad vectorial perfecta al exportar a PDF en cualquier sistema operativo.
