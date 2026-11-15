using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RetrospectivesController : ControllerBase
    {
        private readonly IRetrospectiveService _service;

        public RetrospectivesController(IRetrospectiveService service)
        {
            _service = service;
        }

        [HttpGet("by-sprint/{sprintId:guid}")]
        public async Task<IActionResult> GetBySprint(Guid sprintId)
        {
            try
            {
                var retro = await _service.GetBySprintAsync(sprintId);
                return retro == null ? NotFound() : Ok(retro);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener retrospectiva: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] SaveRetrospectiveDto dto)
        {
            try
            {
                var saved = await _service.SaveAsync(dto);
                return Ok(saved);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al guardar retrospectiva: {ex.Message}");
            }
        }
    }
}
