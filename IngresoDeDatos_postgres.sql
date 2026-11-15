BEGIN;

-- Generate UUIDs using gen_random_uuid()
DO $$
DECLARE
    PlanId UUID := gen_random_uuid();
    ScriptId UUID := gen_random_uuid();
    Task1Id UUID := gen_random_uuid();
    Task2Id UUID := gen_random_uuid();
    Task3Id UUID := gen_random_uuid();
    Task4Id UUID := gen_random_uuid();
    Part1Id UUID := gen_random_uuid();
    Part2Id UUID := gen_random_uuid();
    Part3Id UUID := gen_random_uuid();
    Part4Id UUID := gen_random_uuid();
    Sess1_FCC_Id UUID := gen_random_uuid();
    Sess1_COU_Id UUID := gen_random_uuid();
    Sess2_FCC_Id UUID := gen_random_uuid();
    Sess2_COU_Id UUID := gen_random_uuid();
    Sess3_FCC_Id UUID := gen_random_uuid();
    Sess3_COU_Id UUID := gen_random_uuid();
    Sess4_Ambas_Id UUID := gen_random_uuid();
    Find1Id UUID := gen_random_uuid();
    Find2Id UUID := gen_random_uuid();
    Find3Id UUID := gen_random_uuid();
    Find4Id UUID := gen_random_uuid();
    CurrentDate TIMESTAMPTZ := NOW();
BEGIN
    INSERT INTO "TestPlans" ("Id", "ProjectName", "Product", "EvaluatedModule", "Objective", "UserProfile", "Methodology", "StartDate", "EndDate", "Location", "EstimatedDuration", "Scope", "Status", "WorkflowState", "CreatedAt", "UpdatedAt", "IsActive")
    VALUES (
        PlanId, 
        'Análisis de Usabilidad de freeCodeCamp vs. Coursera', 
        'freeCodeCamp y Coursera', 
        'Barra de búsqueda, registro e inscripción', 
        'Evaluar la usabilidad de tres flujos clave identificando problemas de eficiencia y prevención de errores.', 
        'Estudiantes de nivel universitario (5to nivel, carrera Software); usuarios habituales de laptops.', 
        'Testeo manual moderado – inspección heurística comparativa', 
        '2026-03-19', '2026-03-25', 'Remoto / Navegador web (Chrome)', '30 minutos por caso', 
        'Flujos principales completos', 
        'Completed', 
        '{}',
        CurrentDate, NULL, true
    );

    INSERT INTO "ModeratorScripts" ("Id", "TestPlanId", "Introduction", "FollowUpQuestions", "ClosingInstructions", "CreatedAt", "UpdatedAt", "IsActive")
    VALUES (
        ScriptId, PlanId, 
        '1. Agradece la participación. 2. Explica que se evalúa la interfaz, no a la persona. 3. Pide que piense en voz alta.', 
        '¿Las sugerencias te llevan directamente al contenido? ¿El mensaje de error te dice qué corregir?', 
        '¿Qué fue lo más fácil de usar en cada plataforma? ¿Qué cambiarías primero si pudieras?',
        CurrentDate, NULL, true
    );

    INSERT INTO "TestTasks" ("Id", "TestPlanId", "TaskNumber", "Scenario", "ExpectedResult", "MainMetric", "SuccessCriteria", "MaxTimeSeconds", "CreatedAt", "UpdatedAt", "IsActive")
    VALUES 
    (Task1Id, PlanId, 1, 'Estás buscando un artículo sobre habilidades laborales. Usa la barra de búsqueda y escribe "skill".', 'El usuario comprende qué puede buscar y accede directo', 'Eficiencia (clics)', '0 clics extra', 60, CurrentDate, NULL, true),
    (Task2Id, PlanId, 2, 'Crea una cuenta nueva. Ingresa contraseña incorrecta a propósito y observa los errores.', 'Los campos validan y los errores guían la corrección.', 'Tasa de errores', 'Registro exitoso sin dudas', 120, CurrentDate, NULL, true),
    (Task3Id, PlanId, 3, 'Encuentra un curso de Python e inscríbete gratis. Muéstrame cómo sabes que quedaste inscrito.', 'Inscripción sin ayuda con confirmación clara', 'Retroalimentación', 'Inscripción completada visualmente', 90, CurrentDate, NULL, true),
    (Task4Id, PlanId, 4, 'Ve al catálogo. ¿Puedes identificar rápidamente qué cursos ya tienes inscritos?', 'Identifica cursos sin abrir cada uno', 'Reconocimiento', 'Distinción visual', 60, CurrentDate, NULL, true);

    INSERT INTO "Participants" ("Id", "Name", "Age", "Profile", "CreatedAt", "UpdatedAt", "IsActive")
    VALUES 
    (Part1Id, 'Participante 1 (P1)', 22, 'Analista de Software', CurrentDate, NULL, true),
    (Part2Id, 'Participante 2 (P2)', 23, 'Analista de Software', CurrentDate, NULL, true),
    (Part3Id, 'Participante 3 (P3)', 21, 'Analista - Junior', CurrentDate, NULL, true),
    (Part4Id, 'Participante 4 (P4)', 24, 'Evaluador General', CurrentDate, NULL, true);

    INSERT INTO "TestSessions" ("Id", "TestPlanId", "ParticipantId", "Date", "PlatformTested", "EvaluationPhase", "SatisfactionScore", "CreatedAt", "UpdatedAt", "IsActive")
    VALUES 
    (Sess1_FCC_Id, PlanId, Part1Id, '2026-03-19', 'freeCodeCamp', 'Inicial', 68, CurrentDate, NULL, true),
    (Sess1_COU_Id, PlanId, Part1Id, '2026-03-19', 'Coursera', 'Inicial', 62, CurrentDate, NULL, true),
    (Sess2_FCC_Id, PlanId, Part2Id, '2026-03-20', 'freeCodeCamp', 'Inicial', 70, CurrentDate, NULL, true),
    (Sess2_COU_Id, PlanId, Part2Id, '2026-03-20', 'Coursera', 'Inicial', 58, CurrentDate, NULL, true),
    (Sess3_FCC_Id, PlanId, Part3Id, '2026-03-25', 'freeCodeCamp', 'Final', 88, CurrentDate, NULL, true),
    (Sess3_COU_Id, PlanId, Part3Id, '2026-03-25', 'Coursera', 'Final', 85, CurrentDate, NULL, true),
    (Sess4_Ambas_Id, PlanId, Part4Id, '2026-03-26', 'Ambas Plataformas', 'Final', 92, CurrentDate, NULL, true);

    INSERT INTO "ObservationLogs" ("Id", "TestSessionId", "TestTaskId", "TaskSuccess", "TimeSeconds", "ErrorCount", "Comments", "DetectedProblem", "Severity", "ProposedImprovement", "CreatedAt", "UpdatedAt", "IsActive")
    VALUES 
    (gen_random_uuid(), Sess1_FCC_Id, Task1Id, true, 5, 0, 'Placeholder informa catálogo bien.', 'Ninguno', 'Low', 'Mantener', CurrentDate, NULL, true),
    (gen_random_uuid(), Sess1_COU_Id, Task1Id, false, 18, 2, 'Falsa expectativa de contenido', 'Placeholder genérico y autocompletado deficiente', 'High', 'Cambiar placeholder', CurrentDate, NULL, true),
    (gen_random_uuid(), Sess2_FCC_Id, Task2Id, false, 30, 1, 'Campo de código sin label visible.', 'Falta de label en formulario', 'Medium', 'Agregar label permanente', CurrentDate, NULL, true),
    (gen_random_uuid(), Sess2_COU_Id, Task2Id, false, 150, 3, 'Mensajes de error genéricos', 'Mensajes no indican qué campo falla', 'High', 'Mostrar mensaje específico inline', CurrentDate, NULL, true),
    (gen_random_uuid(), Sess3_FCC_Id, Task3Id, false, 20, 1, 'Inscripción silenciosa.', 'Falta mensaje de confirmación de inscripción', 'Medium', 'Implementar notificación Toast', CurrentDate, NULL, true),
    (gen_random_uuid(), Sess3_COU_Id, Task3Id, false, 90, 4, 'Obliga a tarjeta de crédito. Alertas contraste.', 'Barrera infranqueable y mal contraste', 'High', 'Destacar Auditar gratis sin tarjeta', CurrentDate, NULL, true),
    (gen_random_uuid(), Sess4_Ambas_Id, Task4Id, false, 25, 2, 'Ninguna plataforma muestra badge.', 'Visibilidad deficiente del estado en catálogo', 'High', 'Añadir badge Inscrito', CurrentDate, NULL, true);

    INSERT INTO "Findings" ("Id", "TestPlanId", "Description", "Frequency", "Severity", "Priority", "Status", "Recommendation", "Category", "Tool", "CreatedAt", "UpdatedAt", "IsActive")
    VALUES 
    (Find1Id, PlanId, 'Placeholder genérico en buscador de Coursera', '1/1', 'High', 'High', 'InProgress', 'Cambiar placeholder a Buscar cursos, certificados y proyectos', 'Búsqueda', 'WAVE', CurrentDate, NULL, true),
    (Find2Id, PlanId, 'Campos del formulario sin etiquetas (labels) visibles', '2/2', 'Medium', 'High', 'Open', 'Implementar labels visibles y permanentes', 'Accesibilidad', 'WAVE', CurrentDate, NULL, true),
    (Find3Id, PlanId, 'Inscripción silenciosa en freeCodeCamp', '1/1', 'Medium', 'Medium', 'Open', 'Insertar Toast/notificación de éxito', 'Retroalimentación', 'Observación', CurrentDate, NULL, true),
    (Find4Id, PlanId, 'Ausencia de indicador Inscrito en catálogo', '2/2', 'High', 'High', 'Open', 'Añadir badge en la miniatura del curso', 'Navegación', 'Observación', CurrentDate, NULL, true);

    INSERT INTO "ImprovementActions" ("Id", "FindingId", "Description", "Status", "Priority", "ImplementedDate", "CreatedAt", "UpdatedAt", "IsActive")
    VALUES 
    (gen_random_uuid(), Find1Id, 'Cambiar atributo placeholder en componente de búsqueda', 'InProgress', 'High', NULL, CurrentDate, NULL, true),
    (gen_random_uuid(), Find2Id, 'Añadir etiquetas flotantes a los inputs del Auth', 'Open', 'High', NULL, CurrentDate, NULL, true),
    (gen_random_uuid(), Find3Id, 'Implementar react-hot-toast post-inscripción', 'Open', 'Medium', NULL, CurrentDate, NULL, true),
    (gen_random_uuid(), Find4Id, 'Crear componente Badge si enrolled=true', 'Closed', 'High', '2026-03-24', CurrentDate, NULL, true);

    -- Agile Sprints, User Stories and Tasks
    DECLARE
        Sprint1Id UUID := gen_random_uuid();
        Story1Id UUID := gen_random_uuid();
        Story2Id UUID := gen_random_uuid();
        Story3Id UUID := gen_random_uuid();
    BEGIN
        INSERT INTO "Sprints" ("Id", "TestPlanId", "Name", "Goal", "StartDate", "EndDate", "Status", "CreatedAt", "UpdatedAt", "IsActive")
        VALUES (Sprint1Id, PlanId, 'Sprint 1 - Optimización de Usabilidad e IHC', 'Resolver los problemas críticos de accesibilidad y claridad en búsqueda y formularios', '2026-03-22', '2026-04-05', 'Activo', CurrentDate, NULL, true);

        INSERT INTO "UserStories" ("Id", "TestPlanId", "SprintId", "StoryCode", "Title", "Description", "Priority", "EffortEstimation", "Origin", "FindingId", "Status", "AcceptanceCriteria", "CreatedAt", "UpdatedAt", "IsActive")
        VALUES
        (Story1Id, PlanId, Sprint1Id, 'US-01', 'Mejora de etiquetas accesibles en autenticación', 'Como estudiante universitario, quiero que los campos de contraseña y código tengan labels visibles permanentes para no dudar al completar el formulario.', 'Alta', 5, 'Hallazgo #2 - Accesibilidad', Find2Id, 'InSprint', '["Todos los campos de entrada tienen etiquetas visibles y asociadas via for/id.","Cumplir con criterio WCAG 1.3.1 y 3.3.2."]', CurrentDate, NULL, true),
        (Story2Id, PlanId, Sprint1Id, 'US-02', 'Buscador intuitivo con placeholder descriptivo', 'Como usuario recurrente, quiero que el buscador indique claramente el tipo de contenido que puedo buscar para no ingresar términos no admitidos.', 'Alta', 3, 'Hallazgo #1 - Búsqueda', Find1Id, 'InSprint', '["Placeholder actualizado a: Buscar cursos, certificados y proyectos","Autocompletado despliega resultados relevantes en menos de 300ms."]', CurrentDate, NULL, true),
        (Story3Id, PlanId, NULL, 'US-03', 'Confirmación visual inmediata post-inscripción', 'Como estudiante inscrito, quiero recibir una notificación toast de éxito para tener certeza de que mi inscripción fue completada.', 'Media', 3, 'Hallazgo #3 - Retroalimentación', Find3Id, 'Backlog', '["Se muestra toast verde accesible durante 4 segundos.","El botón de inscripción cambia inmediatamente a estado Inscrito."]', CurrentDate, NULL, true);

        INSERT INTO "SprintTasks" ("Id", "SprintId", "UserStoryId", "TaskCode", "Title", "Description", "EstimatedHours", "Status", "Assignee", "Order", "CreatedAt", "UpdatedAt", "IsActive")
        VALUES
        (gen_random_uuid(), Sprint1Id, Story1Id, 'TSK-01', 'Auditar e insertar labels permanentes en componentes Input', 'Refactorizar componentes AuthInput para soporte nativo de accesibilidad', 4, 'Terminado', 'Dev Frontend', 1, CurrentDate, NULL, true),
        (gen_random_uuid(), Sprint1Id, Story1Id, 'TSK-02', 'Validar compatibilidad con lectores de pantalla (NVDA / VoiceOver)', 'Asegurar que los errores inline sean anunciados por aria-live', 4, 'En progreso', 'Especialista QA', 2, CurrentDate, NULL, true),
        (gen_random_uuid(), Sprint1Id, Story2Id, 'TSK-03', 'Actualizar placeholder y debounce del SearchBar', 'Configurar debounce de 300ms y texto amigable', 3, 'En revisión', 'Dev Frontend', 3, CurrentDate, NULL, true),
        (gen_random_uuid(), Sprint1Id, Story2Id, 'TSK-04', 'Endpoint optimizado de sugerencias de búsqueda en backend', 'Implementar cache de sugerencias frecuentes', 6, 'Pendiente', 'Dev Backend', 4, CurrentDate, NULL, true);

        INSERT INTO "SprintRetrospectives" ("Id", "SprintId", "WhatWentWell", "WhatWentWrong", "WhatCanBeImproved", "ActionItemsJson", "CreatedAt", "UpdatedAt", "IsActive")
        VALUES
        (gen_random_uuid(), Sprint1Id, 
         'Excelente sinergia al conectar los hallazgos de observación directamente con las tareas. Las tareas de accesibilidad se completaron con rapidez.',
         'Dificultad inicial al reproducir las sesiones de Coursera en dispositivos móviles. Tiempos de respuesta lentos en el entorno de pruebas.',
         'Definir criterios de aceptación más concisos antes de iniciar el sprint y automatizar la verificación de contraste de color.',
         '[{"Id":"ACT-1","Description":"Configurar linter de accesibilidad eslint-plugin-jsx-a11y en el pipeline","Assignee":"Dev Frontend","Status":"En progreso"},{"Id":"ACT-2","Description":"Añadir métricas de tiempo de carga en los reportes de QA","Assignee":"Especialista QA","Status":"Pendiente"}]',
         CurrentDate, NULL, true);
    END;
END $$;

COMMIT;
