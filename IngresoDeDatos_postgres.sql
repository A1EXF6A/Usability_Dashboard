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

    INSERT INTO "TestSessions" ("Id", "TestPlanId", "ParticipantId", "Date", "PlatformTested", "CreatedAt", "UpdatedAt", "IsActive")
    VALUES 
    (Sess1_FCC_Id, PlanId, Part1Id, '2026-03-19', 'freeCodeCamp', CurrentDate, NULL, true),
    (Sess1_COU_Id, PlanId, Part1Id, '2026-03-19', 'Coursera', CurrentDate, NULL, true),
    (Sess2_FCC_Id, PlanId, Part2Id, '2026-03-20', 'freeCodeCamp', CurrentDate, NULL, true),
    (Sess2_COU_Id, PlanId, Part2Id, '2026-03-20', 'Coursera', CurrentDate, NULL, true),
    (Sess3_FCC_Id, PlanId, Part3Id, '2026-03-20', 'freeCodeCamp', CurrentDate, NULL, true),
    (Sess3_COU_Id, PlanId, Part3Id, '2026-03-20', 'Coursera', CurrentDate, NULL, true),
    (Sess4_Ambas_Id, PlanId, Part4Id, '2026-03-21', 'Ambas Plataformas', CurrentDate, NULL, true);

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

    -- Sprints 1 a 4
    DECLARE
        Sp1Id UUID := gen_random_uuid();
        Sp2Id UUID := gen_random_uuid();
        Sp3Id UUID := gen_random_uuid();
        Sp4Id UUID := gen_random_uuid();
        Hu1Id UUID := gen_random_uuid();
        Hu2Id UUID := gen_random_uuid();
        Hu3Id UUID := gen_random_uuid();
        Hu4Id UUID := gen_random_uuid();
        Hu5Id UUID := gen_random_uuid();
        Hu6Id UUID := gen_random_uuid();
        Hu7Id UUID := gen_random_uuid();
        Hu8Id UUID := gen_random_uuid();
        Hu9Id UUID := gen_random_uuid();
        Hu10Id UUID := gen_random_uuid();
        TeamJson TEXT := '[{"name":"Miembro 1 (UX/UI Dev)","hoursPerSprint":16},{"name":"Miembro 2 (Frontend Dev)","hoursPerSprint":16},{"name":"Miembro 3 (Backend Dev)","hoursPerSprint":16},{"name":"Miembro 4 (QA / Accesibilidad)","hoursPerSprint":16}]';
    BEGIN
        INSERT INTO "Sprints" ("Id", "TestPlanId", "SprintNumber", "Name", "Goal", "Weeks", "StartDate", "EndDate", "ProductOwner", "ScrumMaster", "DailyHoursPerMember", "WeeklyHoursPerMember", "SprintWeeksCount", "TotalCapacityHours", "TeamMembersJson", "Status", "CreatedAt", "UpdatedAt", "IsActive")
        VALUES
        (Sp1Id, PlanId, 1, 'Sprint 1', 'Diagnóstico, backlog y prototipos iniciales (Baja y media fidelidad)', 'Sem. 10–11', '2026-03-10', '2026-03-24', 'Product Owner (IHC Team)', 'Scrum Master (IHC Team)', 2, 8, 2, 64, TeamJson, 'Completed', CurrentDate, NULL, true),
        (Sp2Id, PlanId, 2, 'Sprint 2', 'Prototipo de alta fidelidad e implementación base del sistema visual', 'Sem. 12–13', '2026-03-24', '2026-04-07', 'Product Owner (IHC Team)', 'Scrum Master (IHC Team)', 2, 8, 2, 64, TeamJson, 'Active', CurrentDate, NULL, true),
        (Sp3Id, PlanId, 3, 'Sprint 3', 'Integración de feedback, accesibilidad e IA analítica', 'Sem. 14–15', '2026-04-07', '2026-04-21', 'Product Owner (IHC Team)', 'Scrum Master (IHC Team)', 2, 8, 2, 64, TeamJson, 'Planned', CurrentDate, NULL, true),
        (Sp4Id, PlanId, 4, 'Sprint 4', 'Cierre, retrospectiva y sustentación final del proyecto integrador', 'Sem. 16', '2026-04-21', '2026-04-28', 'Product Owner (IHC Team)', 'Scrum Master (IHC Team)', 2, 8, 1, 32, TeamJson, 'Planned', CurrentDate, NULL, true);

        INSERT INTO "UserStories" ("Id", "TestPlanId", "Code", "Title", "Description", "Module", "BusinessValue", "StoryPoints", "DecisionQuotient", "PriorityOrder", "Priority", "Status", "AcceptanceCriteria", "FindingId", "SprintId", "CreatedAt", "UpdatedAt", "IsActive")
        VALUES
        (Hu1Id, PlanId, 'HU-01', 'Registro de prueba de usabilidad', 'Como evaluador, quiero registrar una prueba de usabilidad con tareas, tiempos y observaciones para analizar el desempeño de una interfaz.', 'Eval.', 9, 3, 3.00, 1, 'Alta', 'Terminada', 'La prueba se guarda y puede consultarse desde el dashboard.', NULL, Sp1Id, CurrentDate, NULL, true),
        (Hu2Id, PlanId, 'HU-02', 'Visualización de problemas más frecuentes', 'Como usuario del dashboard, quiero visualizar los problemas más frecuentes para identificar rápidamente las principales oportunidades de mejora.', 'Dash.', 8, 2, 4.00, 2, 'Alta', 'Terminada', 'El panel muestra conteos, categorías y filtros básicos.', Find4Id, Sp1Id, CurrentDate, NULL, true),
        (Hu3Id, PlanId, 'HU-03', 'Comparativa antes y después del rediseño', 'Como docente, quiero comparar el antes y el después del aplicativo para verificar si el rediseño mejoró la experiencia.', 'Dash.', 9, 5, 1.80, 3, 'Alta', 'EnProgreso', 'Existen evidencias visuales y métricas comparativas.', NULL, Sp2Id, CurrentDate, NULL, true),
        (Hu4Id, PlanId, 'HU-04', 'Resumen automático de observaciones con IA', 'Como equipo UX, queremos que la IA resuma las observaciones textuales para acelerar la interpretación de hallazgos.', 'IA', 9, 3, 3.00, 4, 'Alta', 'EnProgreso', 'El sistema genera un resumen legible y útil en menos de 5 segundos.', Find1Id, Sp2Id, CurrentDate, NULL, true),
        (Hu5Id, PlanId, 'HU-05', 'Recomendaciones UX sugeridas por IA', 'Como equipo de proyecto, queremos que la IA sugiera recomendaciones UX basadas en problemas detectados.', 'IA', 7, 3, 2.33, 5, 'Media', 'Asignada', 'Se muestran sugerencias asociadas a cada hallazgo.', Find3Id, Sp2Id, CurrentDate, NULL, true),
        (Hu6Id, PlanId, 'HU-06', 'Product Backlog con cociente de decisión', 'Como líder del equipo, quiero registrar historias de usuario en un Product Backlog para planificar el proyecto por sprints.', 'SCRUM', 9, 3, 3.00, 6, 'Alta', 'Terminada', 'Se pueden crear, editar y priorizar historias con BV y SP.', NULL, Sp1Id, CurrentDate, NULL, true),
        (Hu7Id, PlanId, 'HU-07', 'Tablero Kanban de tareas por sprint', 'Como integrante, quiero visualizar mis tareas en un tablero para saber qué debo hacer y en qué estado se encuentran.', 'SCRUM', 8, 3, 2.67, 7, 'Alta', 'EnProgreso', 'El tablero muestra tareas por estado con accesibilidad y drag & drop.', NULL, Sp2Id, CurrentDate, NULL, true),
        (Hu8Id, PlanId, 'HU-08', 'Retrospectivas de sprint y acuerdos', 'Como equipo, queremos registrar retrospectivas para mejorar el siguiente sprint.', 'SCRUM', 6, 2, 3.00, 8, 'Media', 'Asignada', 'Cada sprint guarda acuerdos y lecciones aprendidas.', NULL, Sp3Id, CurrentDate, NULL, true),
        (Hu9Id, PlanId, 'HU-09', 'Formularios comprensibles con validación', 'Como usuario final, quiero un formulario más claro y con validación para evitar errores al registrar resultados.', 'UI', 8, 4, 2.00, 9, 'Alta', 'EnProgreso', 'Los campos son comprensibles y muestran mensajes de ayuda en línea.', Find2Id, Sp2Id, CurrentDate, NULL, true),
        (Hu10Id, PlanId, 'HU-10', 'Navegación consistente y accesible', 'Como usuario nuevo, quiero navegar por el dashboard sin confusión para aprender el sistema rápidamente.', 'UI', 8, 3, 2.67, 10, 'Alta', 'Terminada', 'La navegación es consistente y las etiquetas son claras con WCAG AA.', NULL, Sp1Id, CurrentDate, NULL, true);

        INSERT INTO "SprintTasks" ("Id", "SprintId", "UserStoryId", "Title", "Developer", "Phase", "Type", "EstimatedHours", "RealHours", "Status", "Comment", "CreatedAt", "UpdatedAt", "IsActive")
        VALUES
        (gen_random_uuid(), Sp1Id, Hu1Id, 'Análisis de entidades y modelo relacional de evaluación', 'Miembro 1 (UX/UI Dev)', 'Análisis', 'Nuevo', 4, 4, 'Terminado', 'Diagrama de clases y migraciones completadas', CurrentDate, NULL, true),
        (gen_random_uuid(), Sp1Id, Hu6Id, 'Diseñar estructura de matriz Excel y Product Backlog relacional', 'Miembro 3 (Backend Dev)', 'Diseño', 'Nuevo', 6, 5, 'Terminado', 'Estructura normalizada en EF Core', CurrentDate, NULL, true),
        (gen_random_uuid(), Sp2Id, Hu7Id, 'Construir componente KanbanBoard con accesibilidad y drag & drop', 'Miembro 2 (Frontend Dev)', 'Implementación', 'Nuevo', 8, 6, 'En progreso', 'Columnas y botones de teclado funcionales', CurrentDate, NULL, true),
        (gen_random_uuid(), Sp2Id, Hu9Id, 'Añadir validaciones accesibles en línea y prevención de errores', 'Miembro 4 (QA / Accesibilidad)', 'Pruebas', 'Error', 5, 3, 'En revisión', 'Revisión con WAVE y teclado', CurrentDate, NULL, true);

        INSERT INTO "UnplannedTasks" ("Id", "SprintId", "Date", "Developer", "TaskDescription", "DurationHours", "CreatedAt", "UpdatedAt", "IsActive")
        VALUES
        (gen_random_uuid(), Sp1Id, CurrentDate - INTERVAL '10 days', 'Miembro 3 (Backend Dev)', 'Ajustar permisos de red y puerto Postgres en docker-compose', 2, CurrentDate, NULL, true);

        INSERT INTO "SprintRetrospectives" ("Id", "SprintId", "WhatWentWell", "WhatWentWrong", "CompletedSummary", "PendingSummary", "Agreements", "CreatedAt", "UpdatedAt", "IsActive")
        VALUES
        (gen_random_uuid(), Sp1Id, 'Excelente sinergia en la definición de la arquitectura de información y el diagnóstico de usabilidad.', 'La matriz Excel original requería normalización para modelarse adecuadamente en bases relacionales.', 'Se completaron las historias HU-01, HU-02, HU-06 y HU-10 dentro del tiempo previsto.', 'Quedaron pendientes pruebas heurísticas automatizadas con Lighthouse.', 'Priorizar accesibilidad y validaciones en línea en el siguiente sprint para evitar deuda técnica.', CurrentDate, NULL, true);
    END;
END $$;

COMMIT;
