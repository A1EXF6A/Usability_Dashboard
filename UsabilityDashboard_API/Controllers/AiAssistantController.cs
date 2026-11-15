using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiAssistantController : ControllerBase
    {
        private readonly IAiAssistantService _service;

        public AiAssistantController(IAiAssistantService service)
        {
            _service = service;
        }

        [HttpPost("analyze-usability/{planId:guid}")]
        public async Task<IActionResult> AnalyzeUsability(Guid planId, [FromBody] AnalyzeUsabilityRequestDto? dto)
        {
            try
            {
                var response = await _service.AnalyzeUsabilityAsync(planId, dto?.UserApiKey);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error en el asistente de IA: {ex.Message}");
            }
        }
    }
}
