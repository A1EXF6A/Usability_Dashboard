using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public record UsabilityIssueDto(
        string Category, // "Navegación", "Accesibilidad", "Diseño Visual", "Comprensión del Contenido", "Interacción"
        string Severity, // "Critical", "High", "Medium", "Low"
        string Priority, // "Alta", "Media", "Baja"
        string Description,
        string Source, // e.g. "Observaciones de Tarea #2 (2 fallos)" o "Hallazgo WAVE"
        string Recommendation
    );

    public record ProposedTechnicalTaskDto(
        string Title,
        int EstimatedHours
    );

    public record ProposedUserStoryDto(
        string StoryCode,
        string Title,
        string Description,
        string Priority,
        int EffortEstimation,
        string Origin,
        List<string> AcceptanceCriteria,
        List<ProposedTechnicalTaskDto> TechnicalTasks
    );

    public record AiUsabilityAnalysisResponseDto(
        string Summary,
        List<UsabilityIssueDto> ClassifiedIssues,
        List<ProposedUserStoryDto> ProposedStories
    );

    public record AnalyzeUsabilityRequestDto(
        string? UserApiKey = null
    );
}
