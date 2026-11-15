using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class AnalyzeObservationsRequestDto
    {
        public Guid TestPlanId { get; set; }
        public string? UserApiKey { get; set; }
    }

    public class AiObservationAnalysisDto
    {
        public string Source { get; set; } = "ai"; // "ai" | "mock"
        public string PlanTitle { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public List<AiUxCategoryClassificationDto> Categories { get; set; } = new();
        public List<AiPrioritizedSeverityDto> PrioritizedSeverities { get; set; } = new();
        public List<AiScreenRecommendationDto> ScreenRecommendations { get; set; } = new();
        public List<AiDraftUserStoryDto> DraftUserStories { get; set; } = new();
    }

    public class AiUxCategoryClassificationDto
    {
        public string Category { get; set; } = string.Empty;
        public int FindingCount { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class AiPrioritizedSeverityDto
    {
        public string Severity { get; set; } = "High";
        public string IssueTitle { get; set; } = string.Empty;
        public string Justification { get; set; } = string.Empty;
        public Guid? FindingId { get; set; }
    }

    public class AiScreenRecommendationDto
    {
        public string ScreenOrComponent { get; set; } = string.Empty;
        public string DetectedProblem { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
        public string ExpectedImpact { get; set; } = string.Empty;
    }

    public class AiDraftUserStoryDto
    {
        public string TempId { get; set; } = Guid.NewGuid().ToString("N")[..8];
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Role { get; set; } = "usuario";
        public string Want { get; set; } = string.Empty;
        public string Benefit { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "Alta";
        public string Module { get; set; } = "UI";
        public decimal SuggestedBusinessValue { get; set; } = 8;
        public decimal SuggestedStoryPoints { get; set; } = 3;
        public List<string> AcceptanceCriteria { get; set; } = new();
        public Guid? OriginFindingId { get; set; }
        public string? OriginFindingTitle { get; set; }
    }
}
