using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly IAiAnalysisService _aiService;

        public AiController(IAiAnalysisService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("analyze-observations")]
        public async Task<IActionResult> AnalyzeObservations([FromBody] AnalyzeObservationsRequestDto dto)
        {
            try
            {
                var result = await _aiService.AnalyzeObservationsAsync(dto.TestPlanId, dto.UserApiKey);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error en el análisis de IA: {ex.Message}" });
            }
        }
    }
}
