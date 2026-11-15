using Application.DTOs;
using System;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IAiAnalysisService
    {
        Task<AiObservationAnalysisDto> AnalyzeObservationsAsync(Guid planId, string? userApiKey = null);
    }
}
