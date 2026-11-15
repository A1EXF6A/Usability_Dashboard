using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SprintsController : ControllerBase
    {
        private readonly ISprintService _service;

        public SprintsController(ISprintService service)
        {
            _service = service;
        }

        [HttpGet("by-plan/{planId:guid}")]
        public async Task<IActionResult> GetByPlan(Guid planId)
        {
            try
            {
                var sprints = await _service.GetByPlanAsync(planId);
                return Ok(sprints);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener sprints: {ex.Message}");
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var sprint = await _service.GetByIdAsync(id);
            return sprint == null ? NotFound() : Ok(sprint);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSprintDto dto)
        {
            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear sprint: {ex.Message}");
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSprintDto dto)
        {
            try
            {
                var updated = await _service.UpdateAsync(id, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar sprint: {ex.Message}");
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            return result ? NoContent() : NotFound();
        }

        [HttpPost("{sprintId:guid}/assign-story/{storyId:guid}")]
        public async Task<IActionResult> AssignStory(Guid sprintId, Guid storyId)
        {
            var result = await _service.AssignStoryToSprintAsync(sprintId, storyId);
            return result ? Ok(new { success = true }) : BadRequest("No se pudo asignar la historia al sprint.");
        }

        [HttpPost("remove-story/{storyId:guid}")]
        public async Task<IActionResult> RemoveStory(Guid storyId)
        {
            var result = await _service.RemoveStoryFromSprintAsync(storyId);
            return result ? Ok(new { success = true }) : BadRequest("No se pudo remover la historia del sprint.");
        }
    }
}
