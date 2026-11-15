using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KanbanController : ControllerBase
    {
        private readonly IKanbanService _service;

        public KanbanController(IKanbanService service)
        {
            _service = service;
        }

        [HttpGet("tasks/by-sprint/{sprintId:guid}")]
        public async Task<IActionResult> GetTasksBySprint(Guid sprintId)
        {
            try
            {
                var tasks = await _service.GetTasksBySprintAsync(sprintId);
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener tareas del sprint: {ex.Message}");
            }
        }

        [HttpGet("tasks/{id:guid}")]
        public async Task<IActionResult> GetTaskById(Guid id)
        {
            var task = await _service.GetTaskByIdAsync(id);
            return task == null ? NotFound() : Ok(task);
        }

        [HttpPost("tasks")]
        public async Task<IActionResult> CreateTask([FromBody] CreateSprintTaskDto dto)
        {
            try
            {
                var created = await _service.CreateTaskAsync(dto);
                return CreatedAtAction(nameof(GetTaskById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al crear tarea: {ex.Message}");
            }
        }

        [HttpPut("tasks/{id:guid}")]
        public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateSprintTaskDto dto)
        {
            try
            {
                var updated = await _service.UpdateTaskAsync(id, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar tarea: {ex.Message}");
            }
        }

        [HttpPatch("tasks/{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTaskStatusDto dto)
        {
            var result = await _service.UpdateTaskStatusAsync(id, dto.Status);
            return result ? Ok(new { success = true, status = dto.Status }) : NotFound();
        }

        [HttpPatch("tasks/{id:guid}/assignee")]
        public async Task<IActionResult> UpdateAssignee(Guid id, [FromBody] UpdateTaskAssigneeDto dto)
        {
            var result = await _service.UpdateTaskAssigneeAsync(id, dto.Assignee);
            return result ? Ok(new { success = true, assignee = dto.Assignee }) : NotFound();
        }

        [HttpDelete("tasks/{id:guid}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var result = await _service.DeleteTaskAsync(id);
            return result ? NoContent() : NotFound();
        }

        [HttpGet("team-progress/{sprintId:guid}")]
        public async Task<IActionResult> GetTeamProgress(Guid sprintId)
        {
            try
            {
                var progress = await _service.GetTeamProgressAsync(sprintId);
                return Ok(progress);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener avance del equipo: {ex.Message}");
            }
        }
    }
}
