using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class AiAssistantService : IAiAssistantService
    {
        private readonly IRepository<TestPlan> _planRepository;
        private readonly IRepository<TestSession> _sessionRepository;
        private readonly IRepository<Finding> _findingRepository;
        private readonly IRepository<TestTask> _taskRepository;
        private static readonly HttpClient _httpClient = new HttpClient();

        public AiAssistantService(
            IRepository<TestPlan> planRepository,
            IRepository<TestSession> sessionRepository,
            IRepository<Finding> findingRepository,
            IRepository<TestTask> taskRepository)
        {
            _planRepository = planRepository;
            _sessionRepository = sessionRepository;
            _findingRepository = findingRepository;
            _taskRepository = taskRepository;
        }

        public async Task<AiUsabilityAnalysisResponseDto> AnalyzeUsabilityAsync(Guid testPlanId, string? userApiKey = null)
        {
            var plan = await _planRepository.GetByIdWithIncludesAsync(testPlanId, x => x.Tasks);
            if (plan == null)
                throw new ArgumentException("El Plan de Prueba especificado no existe.");

            var sessions = (await _sessionRepository.GetAllWithIncludesAsync(
                x => x.ObservationLogs,
                x => x.Participant
            ))
            .Where(x => x.TestPlanId == testPlanId)
            .ToList();

            var findings = (await _findingRepository.GetAllWithIncludesAsync(x => x.ImprovementActions))
                .Where(x => x.TestPlanId == testPlanId)
                .ToList();

            var tasks = (await _taskRepository.GetAllAsync())
                .Where(x => x.TestPlanId == testPlanId)
                .OrderBy(x => x.TaskNumber)
                .ToList();

            var logs = sessions.SelectMany(s => s.ObservationLogs).ToList();

            if (logs.Count == 0 && findings.Count == 0 && tasks.Count == 0)
            {
                throw new ArgumentException("No hay datos de usabilidad suficientes (observaciones, hallazgos o tareas) registrados para este plan.");
            }

            var apiKey = userApiKey ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            if (!string.IsNullOrWhiteSpace(apiKey) && !apiKey.Contains("TU_API_KEY") && !apiKey.Contains("AQUI"))
            {
                try
                {
                    return await AnalyzeWithGeminiAsync(plan, sessions, findings, tasks, logs, apiKey);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[AI Usability Analysis Error] Fallback al motor heurístico: {ex.Message}");
                    return GenerateHeuristicAnalysis(plan, sessions, findings, tasks, logs);
                }
            }

            return GenerateHeuristicAnalysis(plan, sessions, findings, tasks, logs);
        }

        private async Task<AiUsabilityAnalysisResponseDto> AnalyzeWithGeminiAsync(
            TestPlan plan,
            List<TestSession> sessions,
            List<Finding> findings,
            List<TestTask> tasks,
            List<ObservationLog> logs,
            string apiKey)
        {
            var context = new StringBuilder();
            context.AppendLine($"Proyecto: {plan.ProjectName}");
            context.AppendLine($"Producto evaluado: {plan.Product}");
            context.AppendLine($"Módulo: {plan.EvaluatedModule}");
            context.AppendLine($"Objetivo: {plan.Objective}");
            context.AppendLine($"Perfil de Usuario: {plan.UserProfile}");
            context.AppendLine($"Sesiones de prueba registradas: {sessions.Count}");
            context.AppendLine($"Total observaciones: {logs.Count}");

            if (logs.Any())
            {
                var successRate = Math.Round((double)logs.Count(l => l.TaskSuccess) / logs.Count * 100, 1);
                var avgTime = Math.Round(logs.Average(l => l.TimeSeconds), 1);
                context.AppendLine($"Tasa de éxito: {successRate}% | Tiempo promedio: {avgTime}s | Errores totales: {logs.Sum(l => l.ErrorCount)}");
                context.AppendLine("Incidentes y problemas detectados en las observaciones:");
                foreach (var log in logs.Where(l => !string.IsNullOrEmpty(l.DetectedProblem) && l.DetectedProblem != "Ninguno").Take(15))
                {
                    context.AppendLine($"- [Severidad: {log.Severity}] Problema: {log.DetectedProblem} | Comentarios: {log.Comments} | Mejora propuesta: {log.ProposedImprovement}");
                }
            }

            if (findings.Any())
            {
                context.AppendLine("\nHallazgos sintetizados previos:");
                foreach (var f in findings)
                {
                    context.AppendLine($"- [{f.Severity} / {f.Priority}] {f.Description} (Herramienta: {f.Tool}, Categoría: {f.Category}) | Recomendación: {f.Recommendation}");
                }
            }

            var prompt = $@"
Actúa como un experto en Usabilidad, Interacción Humano-Computador (IHC) y Metodologías Ágiles (Scrum).
Analiza a fondo las observaciones y datos reales de la evaluación de usabilidad:
{context}

DEBES GENERAR UN ANÁLISIS COMPLETO EN FORMATO JSON ESTRICTO CON LA SIGUIENTE ESTRUCTURA:
{{
  ""summary"": ""Resumen ejecutivo claro de los resultados de la evaluación de usabilidad, destacando puntos fuertes y principales áreas de fricción."",
  ""classifiedIssues"": [
    {{
      ""category"": ""Navegación"", // DEBE SER UNA DE: ""Navegación"", ""Accesibilidad"", ""Diseño Visual"", ""Comprensión del Contenido"", ""Interacción""
      ""severity"": ""Critical"", // ""Critical"", ""High"", ""Medium"", o ""Low""
      ""priority"": ""Alta"", // ""Alta"", ""Media"", o ""Baja""
      ""description"": ""Descripción precisa del problema de usabilidad detectado."",
      ""source"": ""Observación en Tarea #... o Hallazgo..."",
      ""recommendation"": ""Recomendación ergonómica y concreta de diseño centrado en el usuario (IHC) para corregir el problema.""
    }}
  ],
  ""proposedStories"": [
    {{
      ""storyCode"": ""US-01"",
      ""title"": ""Título corto y descriptivo de la historia de usuario"",
      ""description"": ""Como [perfil de usuario] quiero [funcionalidad o mejora del sistema evaluado] para [beneficio esperado]."",
      ""priority"": ""Alta"",
      ""effortEstimation"": 5, // Estimación en puntos o esfuerzo relativo
      ""origin"": ""Origen de la mejora (problema u observación que la generó)"",
      ""acceptanceCriteria"": [
        ""Criterio de aceptación 1..."",
        ""Criterio de aceptación 2...""
      ],
      ""technicalTasks"": [
        {{
          ""title"": ""Tarea técnica para frontend o backend"",
          ""estimatedHours"": 4
        }}
      ]
    }}
  ]
}}
IMPORTANTE:
- Las historias de usuario deben contener las mejoras que se realizarán AL SISTEMA EVALUADO, no las tareas para ejecutar el test.
- Clasifica cada problema en: Navegación, Accesibilidad, Diseño Visual, Comprensión del Contenido o Interacción.
- Devuelve únicamente el JSON crudo sin marcas markdown.
";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[] { new { text = prompt } }
                    }
                },
                generationConfig = new
                {
                    responseMimeType = "application/json",
                    temperature = 0.2
                }
            };

            var model = Environment.GetEnvironmentVariable("GEMINI_MODEL") ?? "gemini-2.5-flash";
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
            var httpContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, httpContent);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(responseBody);

            var rawText = jsonDoc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(rawText))
                throw new Exception("El modelo devolvió una respuesta vacía.");

            // Limpieza y parse
            rawText = CleanJsonString(rawText);
            var parsed = JsonSerializer.Deserialize<AiUsabilityAnalysisResponseDto>(rawText, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return parsed ?? GenerateHeuristicAnalysis(plan, sessions, findings, tasks, logs);
        }

        private AiUsabilityAnalysisResponseDto GenerateHeuristicAnalysis(
            TestPlan plan,
            List<TestSession> sessions,
            List<Finding> findings,
            List<TestTask> tasks,
            List<ObservationLog> logs)
        {
            var userProfile = string.IsNullOrWhiteSpace(plan.UserProfile) ? "Usuario del sistema" : plan.UserProfile;
            var successRate = logs.Any() ? Math.Round((double)logs.Count(l => l.TaskSuccess) / logs.Count * 100, 1) : 0;
            var avgTime = logs.Any() ? Math.Round(logs.Average(l => l.TimeSeconds), 1) : 0;
            var totalErrors = logs.Sum(l => l.ErrorCount);

            var summary = $"Evaluación de usabilidad para el producto '{plan.Product}' ({plan.EvaluatedModule}). " +
                          $"Se registraron {sessions.Count} sesiones con {logs.Count} observaciones. " +
                          $"Tasa de éxito global: {successRate}%, tiempo promedio por tarea: {avgTime}s y un total de {totalErrors} errores observados. " +
                          $"El análisis identifica oportunidades prioritarias en arquitectura de información, accesibilidad y retroalimentación inmediata del sistema.";

            var classifiedIssues = new List<UsabilityIssueDto>();
            var proposedStories = new List<ProposedUserStoryDto>();

            int issueIdx = 1;
            int storyIdx = 1;

            // Mapear desde Hallazgos
            foreach (var f in findings)
            {
                var category = MapCategory(f.Category, f.Description);
                var priority = f.Priority == PriorityLevel.High ? "Alta" : f.Priority == PriorityLevel.Medium ? "Media" : "Baja";
                var severity = f.Severity.ToString();

                classifiedIssues.Add(new UsabilityIssueDto(
                    Category: category,
                    Severity: severity,
                    Priority: priority,
                    Description: f.Description,
                    Source: $"Hallazgo #{issueIdx}: {f.Tool ?? "Observación"}",
                    Recommendation: string.IsNullOrWhiteSpace(f.Recommendation)
                        ? "Optimizar el componente aplicando directrices de heurísticas de Nielsen y WCAG."
                        : f.Recommendation
                ));

                var story = new ProposedUserStoryDto(
                    StoryCode: $"US-{storyIdx:D2}",
                    Title: $"Corregir: {Truncate(f.Description, 50)}",
                    Description: $"Como {userProfile}, quiero que el módulo '{plan.EvaluatedModule}' resuelva '{f.Description}', para completar mi tarea con mayor eficiencia y satisfacción.",
                    Priority: priority,
                    EffortEstimation: priority == "Alta" ? 5 : 3,
                    Origin: $"Hallazgo #{issueIdx} ({f.Category ?? "IHC"})",
                    AcceptanceCriteria: new List<string>
                    {
                        $"El sistema debe eliminar la condición que causa: {f.Description}",
                        $"Se debe verificar la recomendación: {f.Recommendation ?? "Interfaz accesible e intuitiva"}",
                        "La tarea debe completarse sin confusiones ni retrocesos de navegación."
                    },
                    TechnicalTasks: new List<ProposedTechnicalTaskDto>
                    {
                        new ProposedTechnicalTaskDto($"Rediseño ergonómico de UI para {category}", 4),
                        new ProposedTechnicalTaskDto($"Implementación en frontend y validación de accesibilidad", 6)
                    }
                );

                proposedStories.Add(story);
                issueIdx++;
                storyIdx++;
            }

            // Mapear desde Observaciones críticas si no hay hallazgos suficientes
            var problemLogs = logs.Where(l => !string.IsNullOrEmpty(l.DetectedProblem) && l.DetectedProblem != "Ninguno").ToList();
            if (!findings.Any() && problemLogs.Any())
            {
                foreach (var log in problemLogs.Take(4))
                {
                    var cat = MapCategory(log.DetectedProblem, log.Comments);
                    var sev = log.Severity.ToString();
                    var prio = sev == "Critical" || sev == "High" ? "Alta" : "Media";

                    classifiedIssues.Add(new UsabilityIssueDto(
                        Category: cat,
                        Severity: sev,
                        Priority: prio,
                        Description: log.DetectedProblem,
                        Source: $"Observación en sesión de prueba (Tarea {log.TestTaskId})",
                        Recommendation: string.IsNullOrWhiteSpace(log.ProposedImprovement)
                            ? "Añadir retroalimentación interactiva y simplificar el flujo."
                            : log.ProposedImprovement
                    ));

                    proposedStories.Add(new ProposedUserStoryDto(
                        StoryCode: $"US-{storyIdx:D2}",
                        Title: $"Optimización: {Truncate(log.DetectedProblem, 45)}",
                        Description: $"Como {userProfile}, quiero que el sistema evite el problema de '{log.DetectedProblem}', para no cometer errores durante la interacción.",
                        Priority: prio,
                        EffortEstimation: prio == "Alta" ? 5 : 3,
                        Origin: $"Observación incidental - Tarea {log.TestTaskId}",
                        AcceptanceCriteria: new List<string>
                        {
                            $"El flujo debe prevenir el incidente de: {log.DetectedProblem}",
                            "Se deben presentar mensajes de validación y estado comprensibles."
                        },
                        TechnicalTasks: new List<ProposedTechnicalTaskDto>
                        {
                            new ProposedTechnicalTaskDto("Ajustar componentes de interfaz de usuario", 4),
                            new ProposedTechnicalTaskDto("Validar estados de error y flujo asistido", 4)
                        }
                    ));

                    storyIdx++;
                }
            }

            // Fallback si la lista de historias quedó vacía
            if (!proposedStories.Any())
            {
                classifiedIssues.Add(new UsabilityIssueDto(
                    Category: "Interacción",
                    Severity: "Medium",
                    Priority: "Media",
                    Description: "Optimización general del flujo de tareas del módulo evaluado.",
                    Source: "Evaluación heurística preliminar",
                    Recommendation: "Reducir la carga cognitiva aplicando la ley de Hick y simplificando los pasos requeridos."
                ));

                proposedStories.Add(new ProposedUserStoryDto(
                    StoryCode: "US-01",
                    Title: "Optimización ergonómica del flujo principal",
                    Description: $"Como {userProfile}, quiero un flujo intuitivo en '{plan.EvaluatedModule}' para completar mis actividades sin fricción.",
                    Priority: "Media",
                    EffortEstimation: 3,
                    Origin: "Evaluación Heurística General",
                    AcceptanceCriteria: new List<string>
                    {
                        "El usuario debe completar el flujo principal en menos pasos.",
                        "Los controles interactivos deben tener un tamaño mínimo accesible de 44x44px."
                    },
                    TechnicalTasks: new List<ProposedTechnicalTaskDto>
                    {
                        new ProposedTechnicalTaskDto("Auditoría de layout y diseño visual", 4),
                        new ProposedTechnicalTaskDto("Mejora de navegación y enlaces", 4)
                    }
                ));
            }

            return new AiUsabilityAnalysisResponseDto(summary, classifiedIssues, proposedStories);
        }

        private static string MapCategory(string? rawCategory, string? text)
        {
            var combined = $"{rawCategory} {text}".ToLowerInvariant();
            if (combined.Contains("accesib") || combined.Contains("contraste") || combined.Contains("wave") || combined.Contains("label") || combined.Contains("lector"))
                return "Accesibilidad";
            if (combined.Contains("navega") || combined.Contains("menu") || combined.Contains("buscad") || combined.Contains("search") || combined.Contains("link") || combined.Contains("ruta"))
                return "Navegación";
            if (combined.Contains("color") || combined.Contains("diseño") || combined.Contains("visual") || combined.Contains("layout") || combined.Contains("fuente") || combined.Contains("icono"))
                return "Diseño Visual";
            if (combined.Contains("compren") || combined.Contains("mensaje") || combined.Contains("texto") || combined.Contains("placeholder") || combined.Contains("ayuda") || combined.Contains("terminolog"))
                return "Comprensión del Contenido";
            return "Interacción";
        }

        private static string Truncate(string input, int max)
        {
            if (string.IsNullOrWhiteSpace(input)) return string.Empty;
            return input.Length <= max ? input : input.Substring(0, max) + "...";
        }

        private static string CleanJsonString(string raw)
        {
            raw = raw.Trim();
            if (raw.StartsWith("```"))
            {
                int index = raw.IndexOf('\n');
                if (index != -1) raw = raw.Substring(index + 1);
                else raw = raw.Substring(3);

                if (raw.EndsWith("```")) raw = raw.Substring(0, raw.Length - 3);
            }
            return raw.Trim();
        }
    }
}
