using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductBacklogController : ControllerBase
    {
        private readonly IProductBacklogService _service;

        public ProductBacklogController(IProductBacklogService service)
        {
            _service = service;
        }

        [HttpGet("by-plan/{planId:guid}")]
        public async Task<IActionResult> GetByPlan(
            Guid planId,
            [FromQuery] string? search,
            [FromQuery] string? priority,
            [FromQuery] string? status,
            [FromQuery] string? sortBy)
        {
            try
            {
                var stories = await _service.GetByPlanAsync(planId, search, priority, status, sortBy);
                return Ok(stories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener el Product Backlog: {ex.Message}");
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var story = await _service.GetByIdAsync(id);
            return story == null ? NotFound() : Ok(story);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserStoryDto dto)
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
                return StatusCode(500, $"Error al crear elemento en el backlog: {ex.Message}");
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserStoryDto dto)
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
                return StatusCode(500, $"Error al actualizar historia: {ex.Message}");
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            return result ? NoContent() : NotFound();
        }

        [HttpPost("import-approved/{planId:guid}")]
        public async Task<IActionResult> ImportApproved(Guid planId, [FromBody] ImportApprovedStoriesDto dto)
        {
            try
            {
                var imported = await _service.ImportApprovedStoriesAsync(planId, dto.Stories);
                return Ok(imported);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al incorporar historias aprobadas: {ex.Message}");
            }
        }
    }
}
