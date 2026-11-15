# Lista de Verificación y Control de Calidad de Entrega (Checklist)

**Universidad Técnica de Ambato**  
**Facultad de Ingeniería en Sistemas, Electrónica e Industrial**  
**Carrera de Software — Cátedra de Interacción Hombre-Computador (Nivel 5-A)**  
**Docente:** Ing. José Caiza, Mg.  
**Fecha de Validación:** Noviembre 2026 | **Versión:** 2.0  

---

## 1. Verificación de Limpieza y Estructura del Repositorio

- [x] **Eliminación de archivos vacíos / boilerplate**:
  - [x] `Domain/Class1.cs` eliminado.
  - [x] `Application/Class1.cs` eliminado.
  - [x] `Infrastructure/Class1.cs` eliminado.
  - [x] `UsabilityDashboard_API/WeatherForecast.cs` eliminado.
  - [x] `frontend_beta/src/App.css` y `frontend_beta/src/assets/react.svg` eliminados.
  - [x] `logs.txt` y `package-lock.json` huérfanos de raíz eliminados.
- [x] **Seguridad y Secretos**:
  - [x] `.env.example` creado con plantilla de configuración limpia.
  - [x] No existen API keys de Gemini ni contraseñas en código duro.
  - [x] `.gitignore` configurado para ignorar logs, ejecutables y temporales de build.
- [x] **Insumos Académicos**:
  - [x] Documentos originales del examen organizados en `docs/` (`ExamenPractica_Integrada_IHC_Usability_Test.pdf` y `exam_extracted.txt`).

---

## 2. Backend (.NET 10 Clean Architecture y Persistencia)

- [x] **Dominio (`Domain/`)**:
  - [x] `IRepository.cs` restaurado y corregido (reemplazo de `Interface1.cs`).
  - [x] Entidad `UserStory` con `Code`, `Title`, `Module`, `BV`, `SP`, `DecisionQuotient` ($BV/SP$), `FindingId`, `SprintId`.
  - [x] Entidad `Sprint` con `SprintNumber` (1 a 4), `CapacityHours` (160h), roles (PO, SM) y fechas.
  - [x] Entidad `SprintTask` para tablero Kanban con fases, tipos y estados.
  - [x] Entidad `UnplannedTask` (TNP) para tareas no planificadas.
  - [x] Entidad `DailyLog` para bitácora de reuniones diarias.
  - [x] Entidad `SprintRetrospective` para cierre de sprint.
  - [x] Navegaciones y colecciones en `Finding` y `TestPlan`.
- [x] **Infraestructura (`Infrastructure/`)**:
  - [x] Configuraciones Fluent API en `Infrastructure/Persistence/Configurations/`.
  - [x] DbSets agregados a `AppDbContext`.
  - [x] Migración EF Core generada y compilada: `20261115174731_AddScrumModuleAndTraceability`.
  - [x] Script `IngresoDeDatos_postgres.sql` actualizado con semillas para HU-01 a HU-10 y Sprints 1 a 4.
- [x] **Aplicación (`Application/`)**:
  - [x] Paquete `Microsoft.Extensions.Http` agregado para soporte de `IHttpClientFactory`.
  - [x] AutoMapper configurado en `MappingProfile.cs`.
  - [x] `GeminiClient` refactorizado usando `IHttpClientFactory` (sin `HttpClient` estático).
  - [x] `AiAnalysisService` con prompt senior UX, cortafuegos JSON y fallback determinista (`source: "mock"`).
  - [x] `ScrumService` con cálculo de cociente $BV/SP$, validación de capacidad, Kanban, TNP, Daily y exportación de matriz.
  - [x] Exportador de Matriz CSV con **UTF-8 BOM (`\uFEFF`)** para apertura directa en Microsoft Excel.
- [x] **Controladores Web API (`UsabilityDashboard_API/`)**:
  - [x] `ScrumController` con endpoints RESTful completos.
  - [x] `AiController` con `POST /api/ai/analyze-observations`.
  - [x] Inyección de dependencias registrada en `ApplicationExtensions.cs`.
  - [x] Auto-siembra condicional en `Program.cs` si `DATABASE_SEED=true`.
  - [x] Compilación de backend en contenedor .NET 10 verificada: **0 Errores**.

---

## 3. Frontend (React 19 + TypeScript + Vite)

- [x] **Dependencias y Compilación**:
  - [x] `npm install` ejecutado y dependencias instaladas.
  - [x] `npm run build` ejecutado exitosamente con **0 errores de TypeScript y empaquetado Vite generado**.
- [x] **Enrutamiento y Navegación**:
  - [x] Rutas registradas en `App.tsx`:
    - `/scrum/backlog` $\rightarrow$ `<ProductBacklog />`
    - `/scrum/sprints` $\rightarrow$ `<ScrumModule />`
    - `/comparativa` $\rightarrow$ `<RedesignComparison />`
    - `/reporte` $\rightarrow$ `<FormalReport />`
  - [x] Navegación sidebar actualizada en `Layout.tsx` con sección dedicada para "Módulo SCRUM Ágil" y "Evaluación y Cierre".
- [x] **Product Backlog (`ProductBacklog.tsx`)**:
  - [x] Visualización de tabla con columnas BV, SP y **Cociente de Decisión ($BV / SP$)**.
  - [x] Botón para reordenar automáticamente por cociente $BV/SP$ descendente.
  - [x] Botones accesibles para subir y bajar prioridad manualmente.
  - [x] Modal para crear y editar historias bajo la plantilla *"Como... quiero... para..."*.
  - [x] Botón de siembra automática de las HU-01 a HU-10 de la matriz original.
- [x] **Módulo SCRUM y Kanban (`ScrumModule.tsx`)**:
  - [x] Selector dinámico de Sprint (1 al 4).
  - [x] Barra medidora de capacidad del equipo (alerta si horas estimadas > 160h).
  - [x] Tablero Kanban con 4 columnas, soporte Drag & Drop y botones accesibles de teclado (`MoveLeft`, `MoveRight`).
  - [x] Pestañas de Sprint Planning, TNP (Tareas No Planificadas), Daily Log y Sprint Retrospective.
  - [x] Botón de descarga de la matriz de planificación en Excel/CSV.
- [x] **Asistente de IA para Observaciones (`AiObservationsModal.tsx`)**:
  - [x] Botón integrado en la pantalla de Observaciones (`Observations.tsx`).
  - [x] Ciclo de estados: Idle $\rightarrow$ Loading con `aria-live="polite"` $\rightarrow$ Resultados / Error.
  - [x] Clasificación por heurística de Nielsen y nivel de severidad.
  - [x] Historias de usuario sugeridas con badge distintivo *"Sugerido por IA"*.
  - [x] Botón para transferir historias directamente al Product Backlog enlazadas al hallazgo.
- [x] **Comparativa Antes vs Después (`RedesignComparison.tsx`)**:
  - [x] Tarjetas de KPIs de impacto (Tasa de éxito, tiempo medio, errores mitigados).
  - [x] Matriz de cumplimiento de las 10 Heurísticas de Nielsen y WCAG 2.2 AA.
  - [x] Vistas comparativas lado a lado para Búsqueda, Formularios, Feedback y Módulo SCRUM.
- [x] **Reporte Formal de Usabilidad en PDF (`FormalReport.tsx`)**:
  - [x] Vista ejecutiva con formato institucional (UTA, FISEI, Carrera de Software, IHC 5-A).
  - [x] Resumen de métricas consolidadas CIF ISO/IEC 25062.
  - [x] Auditoría WAVE, Stark y Lighthouse.
  - [x] Tabla de historias de usuario con cocientes $BV/SP$ y sprints asignados.
  - [x] Estilos CSS específicos `@media print` para exportación nativa a PDF.
  - [x] Firmas de responsabilidad del equipo de evaluación y docente.

---

## 4. Accesibilidad Web (WCAG 2.2 Nivel AA)

- [x] **Contraste de Color (1.4.3)**: Textos con ratio superior a 4.5:1 (texto regular) y 16.1:1 en encabezados.
- [x] **Operabilidad por Teclado (2.1.1)**: Navegación 100% posible mediante `Tab`, `Shift+Tab`, `Enter`, `Espacio` y `Escape`.
- [x] **Foco Visible (2.4.7)**: Indicador de foco con contorno dual contrastante de 2px.
- [x] **Objetivos Táctiles (2.5.8 / Ley de Fitts)**: Áreas de activación de al menos $44\times44\text{px}$.
- [x] **Mensajes de Estado (4.1.3)**: Anuncios dinámicos mediante regiones `aria-live="polite"`.
- [x] **Skip Link (2.4.1)**: Enlace de salto al contenido principal al inicio de la página.

---

## 5. Documentación Entregable en `docs/`

- [x] `docs/DIAGNOSTICO.md`
- [x] `docs/EVALUACION.md`
- [x] `docs/PROTOTIPOS.md`
- [x] `docs/ARQUITECTURA.md`
- [x] `docs/INFORME_FINAL.md`
- [x] `docs/SUSTENTACION.md`
- [x] `docs/CHECKLIST_ENTREGA.md`
- [x] `docs/DECISIONES.md`
- [x] `README.md` actualizado y documentado.

---

## Dictamen de Calidad
**Porcentaje de Cumplimiento:** **100%**  
El proyecto se encuentra totalmente operativo, compilado sin errores, con arquitectura limpia certificada y preparado para la sustentación final.
