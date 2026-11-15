using Application.DTOs;
using System;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IAiAssistantService
    {
        Task<AiUsabilityAnalysisResponseDto> AnalyzeUsabilityAsync(Guid testPlanId, string? userApiKey = null);
    }
}
