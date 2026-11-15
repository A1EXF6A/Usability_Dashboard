using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _service;

        public DashboardController(IDashboardService service)
        {
            _service = service;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] Guid? testPlanId)
        {
            var stats = await _service.GetStatsAsync(testPlanId);
            return Ok(stats);
        }

        [HttpGet("evaluation-comparison/{planId:guid}")]
        public async Task<IActionResult> GetEvaluationComparison(Guid planId)
        {
            try
            {
                var comparison = await _service.GetEvaluationComparisonAsync(planId);
                return Ok(comparison);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener comparativa de evaluaciones: {ex.Message}");
            }
        }
    }
}
