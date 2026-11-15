using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Application.Services
{
    public class AiAnalysisService : IAiAnalysisService
    {
        private readonly IRepository<TestPlan> _planRepository;
        private readonly IRepository<TestSession> _sessionRepository;
        private readonly IRepository<Finding> _findingRepository;
        private readonly IGeminiClient _geminiClient;

        public AiAnalysisService(
            IRepository<TestPlan> planRepository,
            IRepository<TestSession> sessionRepository,
            IRepository<Finding> findingRepository,
            IGeminiClient geminiClient)
        {
            _planRepository = planRepository;
            _sessionRepository = sessionRepository;
            _findingRepository = findingRepository;
            _geminiClient = geminiClient;
        }

        public async Task<AiObservationAnalysisDto> AnalyzeObservationsAsync(Guid planId, string? userApiKey = null)
        {
            var plan = await _planRepository.GetByIdWithIncludesAsync(planId, x => x.Tasks);
            if (plan == null)
                throw new ArgumentException("El plan de pruebas especificado no existe.");

            var sessions = (await _sessionRepository.GetAllWithIncludesAsync(x => x.ObservationLogs, x => x.Participant))
                .Where(x => x.TestPlanId == planId)
                .ToList();

            var findings = (await _findingRepository.GetAllWithIncludesAsync(x => x.ImprovementActions))
                .Where(x => x.TestPlanId == planId)
                .ToList();

            var observationLogs = sessions.SelectMany(s => s.ObservationLogs).ToList();

            if (!observationLogs.Any() && !findings.Any())
            {
                throw new ArgumentException("No hay observaciones ni hallazgos registrados en este plan de prueba para analizar.");
            }

            var apiKey = userApiKey ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                try
                {
                    return await CallGeminiForAnalysisAsync(plan, sessions, findings, observationLogs, apiKey);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[AiAnalysisService] Fallback determinista activado debido a error: {ex.Message}");
                    return GenerateDeterministicAnalysis(plan, findings, observationLogs, "mock");
                }
            }

            return GenerateDeterministicAnalysis(plan, findings, observationLogs, "mock");
        }

        private async Task<AiObservationAnalysisDto> CallGeminiForAnalysisAsync(
            TestPlan plan,
            List<TestSession> sessions,
            List<Finding> findings,
            List<ObservationLog> observationLogs,
            string apiKey)
        {
            var contextBuilder = new StringBuilder();
            contextBuilder.AppendLine($"Proyecto: {plan.ProjectName}");
            contextBuilder.AppendLine($"Producto: {plan.Product}");
            contextBuilder.AppendLine($"Módulo Evaluado: {plan.EvaluatedModule}");
            contextBuilder.AppendLine($"Objetivo: {plan.Objective}");
            contextBuilder.AppendLine($"Perfil de usuario: {plan.UserProfile}");

            contextBuilder.AppendLine("\n--- OBSERVACIONES DE SESIONES ---");
            foreach (var obs in observationLogs)
            {
                contextBuilder.AppendLine($"- Problema: {obs.DetectedProblem} | Severidad: {obs.Severity} | Éxito: {obs.TaskSuccess} | Errores: {obs.ErrorCount} | Tiempo: {obs.TimeSeconds}s | Comentarios: {obs.Comments} | Mejora sugerida: {obs.ProposedImprovement}");
            }

            if (findings.Any())
            {
                contextBuilder.AppendLine("\n--- HALLAZGOS SINTETIZADOS ---");
                foreach (var f in findings)
                {
                    contextBuilder.AppendLine($"- ID: {f.Id} | {f.Description} | Categoría: {f.Category} | Severidad: {f.Severity} | Recomendación: {f.Recommendation}");
                }
            }

            var systemInstruction = @"Eres un analista senior de Interacción Humano-Computador (IHC) y Evaluador de Usabilidad.
Tu objetivo es analizar estrictamente las observaciones reales y hallazgos recopilados en las pruebas de usabilidad y refinar los resultados.
REGLAS OBLIGATORIAS:
1. Responde ÚNICAMENTE en JSON válido con el esquema solicitado. No agregues texto introductorio ni explicaciones fuera del JSON.
2. NO inventes datos, pantallas o problemas que no estén fundamentados en las observaciones proporcionadas.
3. Todas las descripciones, justificaciones y recomendaciones deben estar en español técnico formal.
4. Genera borradores de historias de usuario en formato estándar: 'Como [perfil], quiero [funcionalidad] para [beneficio]', con criterios de aceptación en checklist y estimaciones razonables de Business Value (1-10) y Story Points (1-13 Fibonacci).";

            var prompt = $@"Analiza la siguiente evidencia de pruebas de usabilidad y genera el informe estructurado de análisis UX:
{contextBuilder}

ESQUEMA JSON REQUERIDO:
{{
  ""planTitle"": ""{plan.ProjectName}"",
  ""summary"": ""Resumen ejecutivo claro de los problemas de usabilidad encontrados..."",
  ""categories"": [
    {{
      ""category"": ""Nombre de la categoría heurística (ej. Prevención de errores, Accesibilidad, Visibilidad)"",
      ""findingCount"": 2,
      ""description"": ""Descripción del impacto observado en esta categoría""
    }}
  ],
  ""prioritizedSeverities"": [
    {{
      ""severity"": ""Critical | High | Medium | Low"",
      ""issueTitle"": ""Título conciso del problema"",
      ""justification"": ""Justificación técnica basada en la tasa de error y fricción observada"",
      ""findingId"": null
    }}
  ],
  ""screenRecommendations"": [
    {{
      ""screenOrComponent"": ""Pantalla o componente evaluado"",
      ""detectedProblem"": ""Fallo detectado"",
      ""recommendation"": ""Recomendación específica de diseño"",
      ""expectedImpact"": ""Impacto positivo esperado en la experiencia""
    }}
  ],
  ""draftUserStories"": [
    {{
      ""tempId"": ""us-1"",
      ""code"": ""HU-IA-01"",
      ""title"": ""Título corto de la historia"",
      ""role"": ""perfil de usuario"",
      ""want"": ""acción requerida"",
      ""benefit"": ""beneficio obtenido"",
      ""description"": ""Como [rol], quiero [want] para [benefit]"",
      ""priority"": ""Alta | Media | Baja"",
      ""module"": ""UI | Eval. | SCRUM | etc."",
      ""suggestedBusinessValue"": 8,
      ""suggestedStoryPoints"": 3,
      ""acceptanceCriteria"": [
        ""Criterio de aceptación 1"",
        ""Criterio de aceptación 2""
      ],
      ""originFindingId"": null,
      ""originFindingTitle"": ""Título o referencia al hallazgo de origen""
    }}
  ]
}}";

            var rawJson = await _geminiClient.GenerateContentAsync(prompt, apiKey, systemInstruction);

            // Firewall defensivo: limpiar markdown blocks
            var cleanJson = ExtractCleanJson(rawJson);
            
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var parsed = JsonSerializer.Deserialize<AiObservationAnalysisDto>(cleanJson, options);
            if (parsed == null)
            {
                throw new InvalidOperationException("Falló la deserialización del JSON devuelto por Gemini.");
            }

            parsed.Source = "ai";
            parsed.PlanTitle = string.IsNullOrWhiteSpace(parsed.PlanTitle) ? plan.ProjectName : parsed.PlanTitle;
            EnsureDefaults(parsed, plan);

            return parsed;
        }

        public AiObservationAnalysisDto GenerateDeterministicAnalysis(
            TestPlan plan,
            List<Finding> findings,
            List<ObservationLog> observationLogs,
            string source = "mock")
        {
            var analysis = new AiObservationAnalysisDto
            {
                Source = source,
                PlanTitle = plan.ProjectName,
                Summary = $"Análisis heurístico consolidado para el proyecto '{plan.ProjectName}' (Módulo: {plan.EvaluatedModule}). Se evaluaron {observationLogs.Count} observaciones de prueba y {findings.Count} hallazgos sintéticos, detectando áreas clave de optimización en claridad visual, retroalimentación al usuario y accesibilidad según lineamientos WCAG y heurísticas de Nielsen."
            };

            // Categorización heurística basada en palabras clave
            var catError = observationLogs.Count(o => ContainsKeywords(o.DetectedProblem + " " + o.Comments, "error", "falla", "bloqueo", "tarjeta"));
            var catVisibilidad = observationLogs.Count(o => ContainsKeywords(o.DetectedProblem + " " + o.Comments, "silenciosa", "badge", "estado", "confirmación", "indicador"));
            var catAccesibilidad = observationLogs.Count(o => ContainsKeywords(o.DetectedProblem + " " + o.Comments, "label", "etiqueta", "contraste", "wave", "stark"));
            var catBusqueda = observationLogs.Count(o => ContainsKeywords(o.DetectedProblem + " " + o.Comments, "placeholder", "buscador", "búsqueda", "filtro"));

            analysis.Categories = new List<AiUxCategoryClassificationDto>
            {
                new() {
                    Category = "Visibilidad del estado del sistema",
                    FindingCount = Math.Max(catVisibilidad, 1),
                    Description = "Falta de retroalimentación inmediata tras completar acciones críticas (inscripción silenciosa, estado de cursos no visible)."
                },
                new() {
                    Category = "Prevención y manejo de errores",
                    FindingCount = Math.Max(catError, 1),
                    Description = "Validaciones genéricas que no indican al usuario qué campo específico requiere corrección."
                },
                new() {
                    Category = "Accesibilidad y Estándares WCAG",
                    FindingCount = Math.Max(catAccesibilidad, 1),
                    Description = "Campos sin etiquetas <label> permanentes y alertas con bajo ratio de contraste lumínico."
                },
                new() {
                    Category = "Reconocimiento antes que recuerdo",
                    FindingCount = Math.Max(catBusqueda, 1),
                    Description = "Placeholders ambiguos y autocompletado insuficiente en los flujos de búsqueda y catálogo."
                }
            };

            // Severidades priorizadas
            int pIndex = 1;
            foreach (var finding in findings.OrderByDescending(f => f.Severity).Take(5))
            {
                analysis.PrioritizedSeverities.Add(new AiPrioritizedSeverityDto
                {
                    Severity = finding.Severity.ToString(),
                    IssueTitle = finding.Description,
                    Justification = $"Severidad {finding.Severity}: Impacta directamente la tasa de éxito de la tarea y genera fricción repetitiva ({finding.Frequency}).",
                    FindingId = finding.Id
                });
            }

            if (!analysis.PrioritizedSeverities.Any())
            {
                analysis.PrioritizedSeverities.Add(new AiPrioritizedSeverityDto
                {
                    Severity = "High",
                    IssueTitle = "Mensajes de error y validación difusa",
                    Justification = "Los usuarios tardan más del doble del tiempo previsto al resolver problemas en formularios sin ayuda contextual."
                });
            }

            // Recomendaciones por pantalla
            analysis.ScreenRecommendations = new List<AiScreenRecommendationDto>
            {
                new() {
                    ScreenOrComponent = "Barra de Búsqueda y Filtros",
                    DetectedProblem = "Placeholder ambiguo y autocompletado impreciso.",
                    Recommendation = "Actualizar placeholder a 'Buscar cursos, certificados y temas...' y ofrecer historial reciente.",
                    ExpectedImpact = "Reducción de clics redundantes en un 35% y mayor agilidad de localización."
                },
                new() {
                    ScreenOrComponent = "Formulario de Registro / Acceso",
                    DetectedProblem = "Ausencia de labels visibles permanentes y mensajes genéricos.",
                    Recommendation = "Implementar labels flotantes accesibles e inline feedback inmediato campo por campo.",
                    ExpectedImpact = "Disminución del 60% en errores de llenado y cumplimiento WCAG 2.2 AA."
                },
                new() {
                    ScreenOrComponent = "Catálogo y Detalle de Contenido",
                    DetectedProblem = "Inscripción sin feedback visual e inexistencia de badge 'Inscrito'.",
                    Recommendation = "Añadir notificación Toast de confirmación con animación y badge prominente en tarjeta.",
                    ExpectedImpact = "Certeza inmediata del estado de la suscripción sin recargar la página."
                }
            };

            // Borradores de Historias de Usuario
            var userRole = string.IsNullOrWhiteSpace(plan.UserProfile) ? "estudiante universitario" : plan.UserProfile;
            var storyList = new List<AiDraftUserStoryDto>();

            var f1 = findings.FirstOrDefault(f => ContainsKeywords(f.Description, "placeholder", "búsqueda", "buscador"));
            storyList.Add(new AiDraftUserStoryDto
            {
                TempId = "us-ia-1",
                Code = "HU-IA-01",
                Title = "Optimizar la barra de búsqueda y filtros",
                Role = userRole,
                Want = "un campo de búsqueda con texto guía claro y sugerencias dinámicas",
                Benefit = "encontrar temas de estudio rápidamente sin adivinar términos exactos",
                Description = $"Como {userRole}, quiero un campo de búsqueda con texto guía claro y sugerencias dinámicas para encontrar temas de estudio rápidamente sin adivinar términos exactos.",
                Priority = "Alta",
                Module = "Búsqueda",
                SuggestedBusinessValue = 9,
                SuggestedStoryPoints = 3,
                AcceptanceCriteria = new List<string>
                {
                    "El placeholder indica explícitamente tipos de contenidos disponibles.",
                    "El campo soporta interacción completa por teclado (Tab, flechas y Enter).",
                    "Muestra sugerencias en menos de 200ms al tipear al menos 2 caracteres."
                },
                OriginFindingId = f1?.Id,
                OriginFindingTitle = f1 != null ? f1.Description : "Hallazgo de búsqueda y localización"
            });

            var f2 = findings.FirstOrDefault(f => ContainsKeywords(f.Description, "label", "etiqueta", "formulario", "error"));
            storyList.Add(new AiDraftUserStoryDto
            {
                TempId = "us-ia-2",
                Code = "HU-IA-02",
                Title = "Implementar validación accesible en formulario",
                Role = userRole,
                Want = "etiquetas fijas y mensajes de error específicos en cada campo",
                Benefit = "corregir datos incorrectos sin frustración ni pérdida de información",
                Description = $"Como {userRole}, quiero etiquetas fijas y mensajes de error específicos en cada campo para corregir datos incorrectos sin frustración ni pérdida de información.",
                Priority = "Alta",
                Module = "UI",
                SuggestedBusinessValue = 8,
                SuggestedStoryPoints = 5,
                AcceptanceCriteria = new List<string>
                {
                    "Cada input tiene su etiqueta <label> asociada mediante atributo for/id.",
                    "Los mensajes de error aparecen en línea debajo del campo en rojo de alto contraste.",
                    "Se incluye aria-invalid y aria-describedby para compatibilidad con lectores de pantalla."
                },
                OriginFindingId = f2?.Id,
                OriginFindingTitle = f2 != null ? f2.Description : "Hallazgo de formulario y etiquetas"
            });

            var f3 = findings.FirstOrDefault(f => ContainsKeywords(f.Description, "inscripción", "toast", "badge", "silenciosa"));
            storyList.Add(new AiDraftUserStoryDto
            {
                TempId = "us-ia-3",
                Code = "HU-IA-03",
                Title = "Notificación de confirmación y badge de estado",
                Role = userRole,
                Want = "una confirmación visual inmediata y un indicador de estado en la tarjeta",
                Benefit = "tener certeza absoluta de haber completado la acción con éxito",
                Description = $"Como {userRole}, quiero una confirmación visual inmediata y un indicador de estado en la tarjeta para tener certeza absoluta de haber completado la acción con éxito.",
                Priority = "Media",
                Module = "Eval.",
                SuggestedBusinessValue = 7,
                SuggestedStoryPoints = 2,
                AcceptanceCriteria = new List<string>
                {
                    "Se dispara un Toast de éxito con mensaje claro y botón de cierre.",
                    "La tarjeta del catálogo actualiza su estado con un badge 'Inscrito'.",
                    "El estado se preserva sin requerir refresco manual de la página."
                },
                OriginFindingId = f3?.Id,
                OriginFindingTitle = f3 != null ? f3.Description : "Hallazgo de feedback visual"
            });

            analysis.DraftUserStories = storyList;
            return analysis;
        }

        private static string ExtractCleanJson(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return "{}";
            
            // Si viene envuelto en ```json ... ```
            var match = Regex.Match(raw, @"```(?:json)?\s*([\s\S]*?)\s*```", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return match.Groups[1].Value.Trim();
            }

            var start = raw.IndexOf('{');
            var end = raw.LastIndexOf('}');
            if (start >= 0 && end > start)
            {
                return raw.Substring(start, end - start + 1).Trim();
            }

            return raw.Trim();
        }

        private static void EnsureDefaults(AiObservationAnalysisDto dto, TestPlan plan)
        {
            if (string.IsNullOrWhiteSpace(dto.Summary))
                dto.Summary = $"Resumen generado por IA para el plan {plan.ProjectName}.";

            dto.Categories ??= new();
            dto.PrioritizedSeverities ??= new();
            dto.ScreenRecommendations ??= new();
            dto.DraftUserStories ??= new();

            int i = 1;
            foreach (var story in dto.DraftUserStories)
            {
                if (string.IsNullOrWhiteSpace(story.TempId))
                    story.TempId = $"us-ia-{i++}";
                if (string.IsNullOrWhiteSpace(story.Code))
                    story.Code = $"HU-IA-{i:D2}";
                if (string.IsNullOrWhiteSpace(story.Description))
                    story.Description = $"Como {story.Role}, quiero {story.Want} para {story.Benefit}.";
                if (story.SuggestedBusinessValue <= 0) story.SuggestedBusinessValue = 7;
                if (story.SuggestedStoryPoints <= 0) story.SuggestedStoryPoints = 3;
                story.AcceptanceCriteria ??= new();
            }
        }

        private static bool ContainsKeywords(string? text, params string[] keywords)
        {
            if (string.IsNullOrWhiteSpace(text)) return false;
            return keywords.Any(k => text.Contains(k, StringComparison.OrdinalIgnoreCase));
        }
    }
}
