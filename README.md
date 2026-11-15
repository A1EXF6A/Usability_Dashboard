# Usability Test Dashboard 2.0

**Universidad Técnica de Ambato (UTA)**  
**Facultad de Ingeniería en Sistemas, Electrónica e Industrial (FISEI)**  
**Carrera de Software — Asignatura:** Interacción Hombre-Computador (Nivel 5-A)  
**Docente:** Ing. José Caiza, Mg.  
**Stack Tecnológico:** .NET 10 + Entity Framework Core + PostgreSQL + React 19 (TypeScript) + Vite  
**Accesibilidad:** Cumplimiento WCAG 2.2 Nivel AA (WAVE, Stark, Lighthouse)  
**Gestión:** SCRUM Relacional con Priorización por Cociente de Decisión ($BV / SP$)  

---

## 1. Propósito y Nuevas Características del Sistema (Versión 2.0)

Sistema integral para la **evaluación formal de usabilidad, auditoría de accesibilidad y planificación ágil de desarrollo (SCRUM)** bajo el enfoque de Diseño Centrado en el Usuario (DCU).

### Novedades y Módulos Implementados en la Versión 2.0:
1. **Módulo SCRUM Relacional Completo**:
   - **Product Backlog**: Gestión completa con cálculo automático del **Cociente de Decisión ($BV / SP$)**, ordenamiento por valor/esfuerzo y siembra automática de las Historias de Usuario HU-01 a HU-10.
   - **Planificación de Sprints y Capacidad**: Control de 160h por Sprint para el equipo, con alertas visuales de sobrecarga.
   - **Tablero Kanban Accesible**: 4 columnas de flujo con soporte de arrastrar y soltar (Drag & Drop) y controles alternativos accesibles mediante teclado (WCAG 2.1.1).
   - **Tareas No Planificadas (TNP)**: Registro y seguimiento de desvíos en horas.
   - **Daily Log y Retrospectiva**: Bitácora diaria y acuerdos de cierre de Sprint.
   - **Exportación de Matriz Excel/CSV**: Generación de archivo `.csv` con prefijo **UTF-8 BOM (`\uFEFF`)** para apertura directa en Microsoft Excel en español.
2. **Asistente de IA Heurístico para Observaciones UX**:
   - Endpoint `POST /api/ai/analyze-observations` conectado a Google Gemini API mediante `IHttpClientFactory`.
   - Limpiador defensivo de respuestas markdown.
   - Fallback determinista automático basado en las 10 heurísticas de Nielsen (`"source": "mock"`), garantizando alta disponibilidad.
   - Transferencia directa de historias sugeridas al Product Backlog enlazadas al hallazgo UX original.
3. **Rediseño Comparativo y Heurísticas (Antes vs Después)**:
   - Comparativa interactiva de pantallas (Búsqueda, Formularios, Feedback y Módulo SCRUM).
   - Matriz de cumplimiento de las 10 Heurísticas de Nielsen y pautas WCAG 2.2.
   - Tarjetas de KPIs de impacto (Tasa de éxito, tiempos medios, reducción de errores).
4. **Reporte Formal de Usabilidad en PDF**:
   - Vista ejecutiva optimizada con `@media print` para exportación nativa a PDF y firmas de responsabilidad.

---

## 2. Documentación Técnica y Académica (`docs/`)

El proyecto cuenta con una suite completa de documentación técnica y académica:

* [Diagnóstico de Usabilidad y Fricciones (DIAGNOSTICO.md)](file:///docs/DIAGNOSTICO.md)
* [Protocolo y Resultados de Evaluación CIF (EVALUACION.md)](file:///docs/EVALUACION.md)
* [Prototipos, Flujos y Design System (PROTOTIPOS.md)](file:///docs/PROTOTIPOS.md)
* [Arquitectura de Software y Modelo de Datos (ARQUITECTURA.md)](file:///docs/ARQUITECTURA.md)
* [Informe Final del Proyecto Integrado (INFORME_FINAL.md)](file:///docs/INFORME_FINAL.md)
* [Guía Estratégica de Sustentación Oral y Diapositivas (SUSTENTACION.md)](file:///docs/SUSTENTACION.md)
* [Lista de Verificación y Control de Calidad (CHECKLIST_ENTREGA.md)](file:///docs/CHECKLIST_ENTREGA.md)
* [Registro de Decisiones de Arquitectura - ADRs (DECISIONES.md)](file:///docs/DECISIONES.md)

---

## 2. Instalacion con Docker (Recomendada)

La forma mas facil de ejecutar el proyecto es usando Docker. No necesitas instalar .NET, PostgreSQL ni Node.js localmente.

### Prerrequisitos
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)

### Pasos para levantar

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd UsabilityDashboard_API-main
```

2. Ejecuta docker-compose:
```bash
docker-compose up --build
```

3. Espera a que todos los servicios esten listos. Veras logs como:
```
api_1        | === Starting API Server ===
frontend_1   | nginx started
```

### Servicios disponibles

| Servicio | URL | Descripcion |
|----------|-----|-------------|
| Frontend | `http://localhost:5000` | Aplicacion React |
| API | `http://localhost:5062` | API REST .NET |
| Swagger UI | `http://localhost:5062/swagger` | Documentacion de la API |
| PostgreSQL | `localhost:5432` | Base de datos |

### Variables de entorno del contenedor

| Variable | Valor | Descripcion |
|----------|-------|-------------|
| `ASPNETCORE_ENVIRONMENT` | `Development` | Entorno de ejecucion |
| `ASPNETCORE_URLS` | `http://+:8080` | URL de escucha de la API |
| `ConnectionStrings__DefaultConnection` | Ver docker-compose.yml | Cadena de conexion a PostgreSQL |
| `DATABASE_SEED` | `true` | Cargar datos de prueba |

### Comandos utiles

```bash
# Iniciar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Eliminar volumes (borrar datos)
docker-compose down -v

# Reconstruir un servicio especifico
docker-compose build api
docker-compose build frontend
```

---

## 3. Instalacion Local (Desarrollo)

Si prefieres desarrollar localmente, necesitas instalar las herramientas manualmente.

### Prerrequisitos

1. **.NET SDK 10** o superior
2. **PostgreSQL** local (instancia en `localhost`)
3. **Node.js 20+** (LTS) y npm (para el frontend)
4. **Entity Framework Core tools** (opcional, se instala en los pasos)

### Comandos de verificacion

```powershell
dotnet --version
node --version
npm --version
```

### Pasos para levantar localmente

#### Paso 1: Configurar la Base de Datos

1. Asegurate de que **PostgreSQL** este corriendo en `localhost`.

2. Crea una base de datos llamada `UsabilityDashboardDb`.

3. Verifica la conexion en `UsabilityDashboard_API/appsettings.json`.

3. Restaura los paquetes NuGet:
```powershell
dotnet restore
```

4. Instala las herramientas de EF Core (si no las tienes):
```powershell
dotnet tool install --global dotnet-ef
```

5. Aplica las migraciones:
```powershell
dotnet ef database update --project .\Infrastructure --startup-project .\UsabilityDashboard_API
```

6. (Opcional) Carga datos de prueba ejecutando `IngresoDeDatos.sql` en tu base de datos.

#### Paso 2: Ejecutar el Backend (API)

```powershell
dotnet run --project .\UsabilityDashboard_API
```

La API estara disponible en:
- **HTTP:** `http://localhost:5062`
- **HTTPS:** `https://localhost:7240`
- **Swagger UI:** `http://localhost:5062/swagger`

#### Paso 3: Ejecutar el Frontend (React)

```powershell
cd .\frontend_beta
npm install
npm run dev
```

El frontend estara disponible en `http://localhost:5000` con proxy automatico a la API.

---

## 4. Arquitectura del Sistema

El proyecto sigue una **arquitectura limpia (Clean Architecture)** con 4 capas bien definidas:

```
UsabilityDashboard_API-main/
├── UsabilityDashboard_API/       # Capa de Presentacion (API REST)
│   ├── Controllers/              # Endpoints HTTP
│   ├── Extensions/               # Configuraciones de servicios
│   ├── Middlewares/               # Middleware de excepciones
│   └── Program.cs                # Punto de entrada
│
├── Application/                  # Capa de Aplicacion (Logica de negocio)
│   ├── DTOs/                     # Data Transfer Objects
│   ├── Interfaces/               # Contratos de servicios
│   ├── Mappings/                 # Perfiles AutoMapper
│   ├── Services/                 # Implementaciones de servicios
│   └── Validators/               # Validaciones FluentValidation
│
├── Domain/                       # Capa de Dominio (Entidades y reglas)
│   ├── Common/                   # Enums y clases base
│   ├── Entities/                 # Entidades de dominio
│   └── Interfaces/               # Contratos del repositorio
│
└── Infrastructure/               # Capa de Infraestructura (Persistencia)
    ├── Persistence/              # DbContext y repositorio generico
    └── Migrations/               # Migraciones EF Core
```

### Dependencias entre capas

```
Domain <-- Application <-- Infrastructure <-- UsabilityDashboard_API
```

- **Domain**: No tiene dependencias externas
- **Application**: Depende de Domain
- **Infrastructure**: Depende de Application
- **UsabilityDashboard_API**: Depende de Application e Infrastructure

### Arquitectura Docker

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Network                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Frontend   │    │     API      │    │ PostgreSQL   │      │
│  │   (Nginx)    │───>│   (.NET 10)  │───>│   (16-alpine)│      │
│  │  Puerto 5000 │    │ Puerto 8080  │    │ Puerto 5432  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         └───────────────────┴───────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

- **Frontend**: Nginx sirve archivos estaticos y proxea `/api` al contenedor API
- **API**: .NET 10 ejecuta la API REST, aplica migraciones automaticamente
- **PostgreSQL**: Base de datos con volumen persistente

---

## 4. Entidades del Dominio

### TestPlan (Plan de Prueba)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| ProjectName | string | Nombre del proyecto |
| Product | string | Producto evaluado |
| EvaluatedModule | string | Modulo evaluado |
| Objective | string | Objetivo de la prueba |
| UserProfile | string | Perfil del usuario objetivo |
| Methodology | string | Metodologia utilizada |
| StartDate | DateTime | Fecha de inicio |
| EndDate | DateTime | Fecha de finalizacion |
| Location | string | Ubicacion/plataforma |
| EstimatedDuration | string | Duracion estimada |
| Scope | string | Alcance de la prueba |
| Status | TestPlanStatus | Draft, InProgress, Completed, Cancelled |
| WorkflowState | string | JSON con estados de las secciones del workflow |

### TestTask (Tarea de Prueba)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| TestPlanId | Guid | FK al plan de prueba |
| TaskNumber | int | Numero de tarea |
| Scenario | string | Escenario de la tarea |
| ExpectedResult | string | Resultado esperado |
| MainMetric | string | Metrica principal |
| SuccessCriteria | string | Criterios de exito |
| MaxTimeSeconds | int | Tiempo maximo en segundos |

### Participant (Participante)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| Name | string | Nombre o seudonimo |
| Age | int | Edad |
| Profile | string | Perfil del participante |

### TestSession (Sesion de Prueba)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| TestPlanId | Guid | FK al plan de prueba |
| ParticipantId | Guid | FK al participante |
| Date | DateTime | Fecha de la sesion |
| PlatformTested | string | Plataforma evaluada |

### ObservationLog (Registro de Observacion)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| TestSessionId | Guid | FK a la sesion |
| TestTaskId | Guid | FK a la tarea |
| TaskSuccess | bool | Si la tarea fue exitosa |
| TimeSeconds | int | Tiempo empleado en segundos |
| ErrorCount | int | Cantidad de errores |
| Comments | string | Comentarios del observador |
| DetectedProblem | string | Problema detectado |
| Severity | SeverityLevel | Low, Medium, High, Critical |
| ProposedImprovement | string | Mejora propuesta |

### Finding (Hallazgo de Usabilidad)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| TestPlanId | Guid | FK al plan de prueba |
| Description | string | Descripcion del hallazgo |
| Frequency | string | Frecuencia de aparicion |
| Severity | SeverityLevel | Low, Medium, High, Critical |
| Priority | PriorityLevel | Low, Medium, High |
| Status | ActionStatus | Open, InProgress, Resolved, Closed |
| Recommendation | string | Recomendacion de mejora |
| Category | string | Categoria del hallazgo |
| Tool | string | Herramienta utilizada |

### ImprovementAction (Accion de Mejora)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| FindingId | Guid | FK al hallazgo |
| Description | string | Descripcion de la accion |
| Status | ActionStatus | Open, InProgress, Resolved, Closed |
| Priority | PriorityLevel | Low, Medium, High |
| ImplementedDate | DateTime? | Fecha de implementacion |

### ModeratorScript (Script del Moderador)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| TestPlanId | Guid | FK al plan de prueba |
| Introduction | string | Introduccion del moderador |
| FollowUpQuestions | string | Preguntas de seguimiento |
| ClosingInstructions | string | Instrucciones de cierre |

### SprintBacklog (Backlog de Sprint)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| TestPlanId | Guid | FK al plan de prueba |
| SprintName | string | Nombre del sprint |
| SprintGoal | string | Objetivo del sprint |
| ContentJson | string | JSON estructurado con historias y tareas |
| RawMarkdown | string | Borador en formato Markdown |

### Enums

| Enum | Valores |
|------|---------|
| TestPlanStatus | Draft, InProgress, Completed, Cancelled |
| SeverityLevel | Low, Medium, High, Critical |
| PriorityLevel | Low, Medium, High |
| ActionStatus | Open, InProgress, Resolved, Closed |

### BaseEntity
Todas las entidades heredan de `BaseEntity`:
- `Id` (Guid) - Identificador unico
- `CreatedAt` (DateTime) - Fecha de creacion
- `UpdatedAt` (DateTime?) - Fecha de actualizacion
- `IsActive` (bool) - Soft delete (default: true)

---

## 5. Endpoints de la API

### TestPlans (`/api/TestPlans`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/TestPlans` | Obtener todos los planes |
| GET | `/api/TestPlans/{id}` | Obtener un plan por ID (incluye Tasks, Findings, Sessions, ModeratorScript) |
| POST | `/api/TestPlans` | Crear un nuevo plan |
| PUT | `/api/TestPlans/{id}` | Actualizar un plan |
| PATCH | `/api/TestPlans/{id}/status` | Actualizar solo el estado |
| DELETE | `/api/TestPlans/{id}` | Eliminar un plan (soft delete) |

### TestTasks (`/api/TestTasks`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/TestTasks/by-plan/{planId}` | Obtener tareas por plan |
| GET | `/api/TestTasks/{id}` | Obtener una tarea por ID |
| POST | `/api/TestTasks` | Crear una tarea |
| PUT | `/api/TestTasks/{id}` | Actualizar una tarea |
| DELETE | `/api/TestTasks/{id}` | Eliminar una tarea |

### Participants (`/api/Participants`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/Participants` | Obtener todos los participantes |
| GET | `/api/Participants/{id}` | Obtener un participante por ID |
| POST | `/api/Participants` | Crear un participante |
| PUT | `/api/Participants/{id}` | Actualizar un participante |
| DELETE | `/api/Participants/{id}` | Eliminar un participante |

### TestSessions (`/api/TestSessions`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/TestSessions?testPlanId={id}` | Obtener sesiones (filtro por plan opcional) |
| GET | `/api/TestSessions/{id}` | Obtener una sesion por ID |
| POST | `/api/TestSessions` | Crear una sesion |
| PUT | `/api/TestSessions/{id}` | Actualizar una sesion |
| DELETE | `/api/TestSessions/{id}` | Eliminar una sesion |

### ObservationLogs (`/api/ObservationLogs`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/ObservationLogs?testSessionId={id}&testTaskId={id}` | Obtener observaciones (filtros opcionales) |
| GET | `/api/ObservationLogs/{id}` | Obtener una observacion por ID |
| POST | `/api/ObservationLogs` | Crear una observacion |
| PUT | `/api/ObservationLogs/{id}` | Actualizar una observacion |
| DELETE | `/api/ObservationLogs/{id}` | Eliminar una observacion |

### Findings (`/api/Findings`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/Findings/by-plan/{planId}` | Obtener hallazgos por plan |
| GET | `/api/Findings/{id}` | Obtener un hallazgo por ID |
| POST | `/api/Findings` | Crear un hallazgo |
| PUT | `/api/Findings/{id}` | Actualizar un hallazgo |
| DELETE | `/api/Findings/{id}` | Eliminar un hallazgo |

### ImprovementActions (`/api/ImprovementActions`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/ImprovementActions/by-finding/{findingId}` | Obtener acciones por hallazgo |
| GET | `/api/ImprovementActions/{id}` | Obtener una accion por ID |
| POST | `/api/ImprovementActions` | Crear una accion de mejora |
| PUT | `/api/ImprovementActions/{id}` | Actualizar una accion |
| PATCH | `/api/ImprovementActions/{id}/status` | Actualizar solo el estado |
| DELETE | `/api/ImprovementActions/{id}` | Eliminar una accion |

### ModeratorScripts (`/api/ModeratorScripts`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/ModeratorScripts/by-plan/{planId}` | Obtener script por plan |
| GET | `/api/ModeratorScripts/{id}` | Obtener un script por ID |
| POST | `/api/ModeratorScripts` | Crear un script |
| PUT | `/api/ModeratorScripts/{id}` | Actualizar un script |
| DELETE | `/api/ModeratorScripts/{id}` | Eliminar un script |

### SprintBacklog (`/api/SprintBacklog`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/SprintBacklog/by-plan/{planId}` | Obtener backlog por plan |
| POST | `/api/SprintBacklog/generate` | Generar backlog con IA |
| POST | `/api/SprintBacklog/save/{planId}` | Guardar backlog editado |
| POST | `/api/SprintBacklog/chat` | Chat con asistente de IA |

### Dashboard (`/api/Dashboard`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/Dashboard/stats?testPlanId={id}` | Estadisticas del dashboard (filtro por plan opcional) |

---

## 6. DTOs (Data Transfer Objects)

### TestPlanDto
```json
{
  "id": "guid",
  "projectName": "string",
  "product": "string",
  "evaluatedModule": "string",
  "objective": "string",
  "userProfile": "string",
  "methodology": "string",
  "startDate": "datetime",
  "endDate": "datetime",
  "location": "string",
  "estimatedDuration": "string",
  "scope": "string",
  "status": "string (Draft|InProgress|Completed|Cancelled)",
  "workflowState": "string (JSON)",
  "createdAt": "datetime"
}
```

### DashboardStatsDto
```json
{
  "totalObservations": 0,
  "successRate": 0.0,
  "averageTimeSeconds": 0.0,
  "totalErrors": 0,
  "totalFindings": 0,
  "criticalFindings": 0,
  "moderateFindings": 0,
  "totalActions": 0,
  "completedActions": 0,
  "pendingActions": 0,
  "inProgressActions": 0,
  "errorsBySeverity": [{ "severity": "string", "count": 0 }],
  "successByTask": [{ "taskId": "guid", "total": 0, "successes": 0, "avgTime": 0.0 }],
  "statsByPlatform": [{ "platform": "string", "totalObservations": 0, "successes": 0, "avgTimeSeconds": 0.0 }]
}
```

### SprintBacklogDto
```json
{
  "id": "guid",
  "testPlanId": "guid",
  "sprintName": "string",
  "sprintGoal": "string",
  "contentJson": "string (JSON)",
  "rawMarkdown": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## 7. Validaciones

El proyecto utiliza **FluentValidation** para validar los DTOs de creacion:

### CreateTestPlanValidator
- `ProjectName`: obligatorio, max 200 caracteres
- `Product`: obligatorio, max 200 caracteres
- `EvaluatedModule`: obligatorio
- `Objective`: obligatorio, max 1000 caracteres
- `UserProfile`: obligatorio
- `Methodology`: obligatorio
- `StartDate`: obligatorio
- `EndDate`: obligatorio, debe ser posterior a StartDate

### CreateTestTaskValidator
- `TestPlanId`: obligatorio
- `TaskNumber`: mayor a 0
- `Scenario`: obligatorio, max 1000 caracteres
- `ExpectedResult`: obligatorio
- `MainMetric`: obligatorio
- `MaxTimeSeconds`: mayor a 0

### CreateParticipantValidator
- `Name`: obligatorio, max 200 caracteres
- `Age`: entre 1 y 120
- `Profile`: obligatorio, max 500 caracteres

### CreateTestSessionValidator
- `TestPlanId`: obligatorio
- `ParticipantId`: obligatorio
- `Date`: obligatorio, no puede ser futura
- `PlatformTested`: obligatorio, max 200 caracteres

### CreateFindingValidator
- `TestPlanId`: obligatorio
- `Description`: obligatorio, max 1000 caracteres
- `Severity`: Low, Medium, High, Critical
- `Priority`: Low, Medium, High
- `Recommendation`: obligatorio

### CreateObservationLogValidator
- `TestSessionId`: obligatorio
- `TestTaskId`: obligatorio
- `TimeSeconds`: >= 0
- `ErrorCount`: >= 0
- `DetectedProblem`: obligatorio

---

## 8. Manejo de Errores

El middleware `ExceptionMiddleware` captura y transforma excepciones en respuestas HTTP JSON:

| Excepcion | HTTP Status | Respuesta |
|-----------|-------------|-----------|
| `ValidationException` | 400 Bad Request | Errores agrupados por campo |
| `KeyNotFoundException` | 404 Not Found | Mensaje del recurso no encontrado |
| `ArgumentException` | 400 Bad Request | Mensaje del argumento invalido |
| Excepcion general | 500 Internal Server Error | "An unexpected error occurred" |

### Formato de respuesta de error
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "FieldName": ["Error message 1", "Error message 2"]
  }
}
```

---

## 9. Configuracion

### Base de Datos
Archivo: `UsabilityDashboard_API/appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=UsabilityDashboardDb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

### CORS
Origenes permitidos:
- `http://localhost:3000` (React)
- `http://localhost:4200` (Angular)
- `http://localhost:5173` (Vite)

### Puertos
- HTTP: `http://localhost:5062`
- HTTPS: `https://localhost:7240`
- Swagger UI: `http://localhost:5062/swagger` (raiz `/`)

### Variables de Entorno
El `Program.cs` carga automaticamente un archivo `.env` si existe en el directorio de trabajo.

---

## 10. Paquetes NuGet

### UsabilityDashboard_API.csproj
| Paquete | Version | Uso |
|---------|---------|-----|
| FluentValidation.DependencyInjectionExtensions | 12.1.1 | Inyeccion de validaciones |
| Microsoft.AspNetCore.OpenApi | 10.0.5 | Documentacion OpenAPI |
| Microsoft.EntityFrameworkCore.Design | 10.0.5 | Herramientas de migracion |
| Swashbuckle.AspNetCore | 10.1.5 | Swagger UI |

### Application.csproj
| Paquete | Version | Uso |
|---------|---------|-----|
| AutoMapper | 16.1.1 | Mapeo entre entidades y DTOs |
| FluentValidation | 12.1.1 | Validacion de DTOs |

### Infrastructure.csproj
| Paquete | Version | Uso |
|---------|---------|-----|
| Microsoft.EntityFrameworkCore | 10.0.5 | ORM |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.5 | Provider PostgreSQL |
| Microsoft.EntityFrameworkCore.Tools | 10.0.5 | Herramientas EF Core |

---

## 11. Pasos para Levantar el Proyecto

### Paso 1: Configurar la Base de Datos

1. Asegurate de que **PostgreSQL** este corriendo en `localhost`.

2. Crea una base de datos llamada `UsabilityDashboardDb`.

3. Restaura los paquetes NuGet:
```powershell
dotnet restore
```

4. Instala las herramientas de EF Core (si no las tienes):
```powershell
dotnet tool install --global dotnet-ef
```

5. Aplica las migraciones:
```powershell
dotnet ef database update --project .\Infrastructure --startup-project .\UsabilityDashboard_API
```

6. (Opcional) Carga datos de prueba ejecutando `IngresoDeDatos.sql` en tu base de datos.

### Paso 2: Ejecutar el Backend (API)

```powershell
dotnet run --project .\UsabilityDashboard_API
```

La API estara disponible en:
- **HTTP:** `http://localhost:5062`
- **HTTPS:** `https://localhost:7240`
- **Swagger UI:** `http://localhost:5062/swagger`

### Paso 3: Ejecutar el Frontend (React)

```powershell
cd .\frontend_beta
npm install
npm run dev
```

El frontend estara disponible en `http://localhost:5000` con proxy automatico a la API.

---

## 12. Flujo de Datos

```
Cliente (React) --> Controller --> Service --> Repository --> EF Core --> PostgreSQL
      |                                                          ^
      |              AutoMapper (DTO <-> Entity)                 |
      +-- DTOs <--+                                       Entities
```

### Patron de repositorio generico
El repositorio `GenericRepository<T>` proporciona operaciones CRUD basicas:
- `GetAllAsync()` - Filtra por `IsActive = true`
- `GetByIdAsync(id)` - Filtra por `Id` y `IsActive = true`
- `AddAsync(entity)` - Inserta y guarda
- `UpdateAsync(entity)` - Actualiza y guarda
- `DeleteAsync(id)` - Soft delete ( IsActive = false)

---

## 13. Diagrama de Relaciones

```
TestPlan (1) -----> (N) TestTask
TestPlan (1) -----> (1) ModeratorScript
TestPlan (1) -----> (N) TestSession
TestPlan (1) -----> (N) Finding
TestPlan (1) -----> (1) SprintBacklog

TestSession (1) --> (N) ObservationLog
TestSession (N) --> (1) Participant

TestTask (1) -----> (N) ObservationLog

Finding (1) ------> (N) ImprovementAction
```

---

## 14. Solucion de Problemas

### Docker

| Problema | Solucion |
|----------|----------|
| PostgreSQL no inicia | Verifica que Docker tenga suficiente memoria (4GB recomendado) |
| API no conecta con PostgreSQL | Espera 30 segundos tras `docker-compose up` para que PostgreSQL este listo |
| Puerto 5000 o 5062 en uso | Cambia los puertos en `docker-compose.yml` (seccion `ports`) |
| Error de permisos en Linux | Ejecuta `sudo docker-compose up --build` |
| Contenedor API reinicia | Revisa logs con `docker-compose logs api` |

### Local

| Problema | Solucion |
|----------|----------|
| Error de conexion a PostgreSQL | Verifica que PostgreSQL este corriendo en localhost y revisa los privilegios de tu usuario |
| `dotnet-ef` no reconocido | Ejecuta: `dotnet tool install --global dotnet-ef` |
| Frontend no conecta con backend | Confirma que la API este corriendo en el puerto 5062 |
| Puerto 5000 ya en uso | Cambia el puerto en `frontend_beta/vite.config.ts` |
| Migraciones fallan | Ejecuta `dotnet restore` primero y verifica la cadena de conexion |
| Validaciones no se ejecutan | Verifica que los validadores esten registrados en `ApplicationExtensions.cs` |

---

## 15. Licencia

Revisa `LICENSE.txt` para mas informacion.
