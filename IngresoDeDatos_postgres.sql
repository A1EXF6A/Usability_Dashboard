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
END $$;

COMMIT;
