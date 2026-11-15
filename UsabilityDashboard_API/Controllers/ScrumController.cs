using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScrumController : ControllerBase
    {
        private readonly IScrumService _scrumService;

        public ScrumController(IScrumService scrumService)
        {
            _scrumService = scrumService;
        }

        #region Backlog / User Stories

        [HttpGet("backlog/{planId:guid}")]
        public async Task<IActionResult> GetBacklog(Guid planId)
        {
            var stories = await _scrumService.GetBacklogByPlanAsync(planId);
            return Ok(stories);
        }

        [HttpGet("story/{id:guid}")]
        public async Task<IActionResult> GetStoryById(Guid id)
        {
            var story = await _scrumService.GetUserStoryByIdAsync(id);
            return story == null ? NotFound() : Ok(story);
        }

        [HttpPost("story")]
        public async Task<IActionResult> CreateStory([FromBody] CreateUserStoryDto dto)
        {
            var created = await _scrumService.CreateUserStoryAsync(dto);
            return CreatedAtAction(nameof(GetStoryById), new { id = created.Id }, created);
        }

        [HttpPut("story/{id:guid}")]
        public async Task<IActionResult> UpdateStory(Guid id, [FromBody] UpdateUserStoryDto dto)
        {
            try
            {
                var updated = await _scrumService.UpdateUserStoryAsync(id, dto);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("story/{id:guid}")]
        public async Task<IActionResult> DeleteStory(Guid id)
        {
            var success = await _scrumService.DeleteUserStoryAsync(id);
            return success ? NoContent() : NotFound();
        }

        [HttpPost("backlog/reorder/{planId:guid}")]
        public async Task<IActionResult> ReorderStories(Guid planId, [FromBody] ReorderUserStoriesDto dto)
        {
            var stories = await _scrumService.ReorderUserStoriesAsync(planId, dto.StoryIds);
            return Ok(stories);
        }

        [HttpPost("backlog/sort-by-quotient/{planId:guid}")]
        public async Task<IActionResult> SortBacklogByQuotient(Guid planId)
        {
            var stories = await _scrumService.SortBacklogByQuotientAsync(planId);
            return Ok(stories);
        }

        #endregion

        #region Sprints

        [HttpGet("sprints/{planId:guid}")]
        public async Task<IActionResult> GetSprints(Guid planId)
        {
            var sprints = await _scrumService.GetSprintsByPlanAsync(planId);
            return Ok(sprints);
        }

        [HttpGet("sprint/{id:guid}/detail")]
        public async Task<IActionResult> GetSprintDetail(Guid id)
        {
            var detail = await _scrumService.GetSprintDetailAsync(id);
            return detail == null ? NotFound() : Ok(detail);
        }

        [HttpPost("sprint")]
        public async Task<IActionResult> CreateSprint([FromBody] CreateSprintDto dto)
        {
            var created = await _scrumService.CreateSprintAsync(dto);
            return Ok(created);
        }

        [HttpPut("sprint/{id:guid}")]
        public async Task<IActionResult> UpdateSprint(Guid id, [FromBody] UpdateSprintDto dto)
        {
            try
            {
                var updated = await _scrumService.UpdateSprintAsync(id, dto);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("sprint/{id:guid}")]
        public async Task<IActionResult> DeleteSprint(Guid id)
        {
            var success = await _scrumService.DeleteSprintAsync(id);
            return success ? NoContent() : NotFound();
        }

        [HttpPost("sprint/{id:guid}/assign-stories")]
        public async Task<IActionResult> AssignStories(Guid id, [FromBody] AssignStoriesDto dto)
        {
            var success = await _scrumService.AssignStoriesToSprintAsync(id, dto.StoryIds);
            return success ? Ok(new { message = "Historias asignadas exitosamente." }) : NotFound();
        }

        #endregion

        #region Tasks (Kanban)

        [HttpGet("tasks/{sprintId:guid}")]
        public async Task<IActionResult> GetTasks(Guid sprintId)
        {
            var tasks = await _scrumService.GetTasksBySprintAsync(sprintId);
            return Ok(tasks);
        }

        [HttpPost("task")]
        public async Task<IActionResult> CreateTask([FromBody] CreateSprintTaskDto dto)
        {
            var created = await _scrumService.CreateTaskAsync(dto);
            return Ok(created);
        }

        [HttpPut("task/{id:guid}")]
        public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateSprintTaskDto dto)
        {
            try
            {
                var updated = await _scrumService.UpdateTaskAsync(id, dto);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("task/{id:guid}/status")]
        public async Task<IActionResult> UpdateTaskStatus(Guid id, [FromBody] UpdateTaskStatusDto dto)
        {
            try
            {
                var updated = await _scrumService.UpdateTaskStatusAsync(id, dto.Status);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("task/{id:guid}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var success = await _scrumService.DeleteTaskAsync(id);
            return success ? NoContent() : NotFound();
        }

        #endregion

        #region Tareas No Planificadas (TNP)

        [HttpGet("unplanned/{sprintId:guid}")]
        public async Task<IActionResult> GetUnplannedTasks(Guid sprintId)
        {
            var list = await _scrumService.GetUnplannedTasksBySprintAsync(sprintId);
            return Ok(list);
        }

        [HttpPost("unplanned")]
        public async Task<IActionResult> CreateUnplannedTask([FromBody] CreateUnplannedTaskDto dto)
        {
            var created = await _scrumService.CreateUnplannedTaskAsync(dto);
            return Ok(created);
        }

        [HttpDelete("unplanned/{id:guid}")]
        public async Task<IActionResult> DeleteUnplannedTask(Guid id)
        {
            var success = await _scrumService.DeleteUnplannedTaskAsync(id);
            return success ? NoContent() : NotFound();
        }

        #endregion

        #region Daily Log

        [HttpGet("daily/{sprintId:guid}")]
        public async Task<IActionResult> GetDailyLogs(Guid sprintId)
        {
            var list = await _scrumService.GetDailyLogsBySprintAsync(sprintId);
            return Ok(list);
        }

        [HttpPost("daily")]
        public async Task<IActionResult> CreateDailyLog([FromBody] CreateDailyLogDto dto)
        {
            var created = await _scrumService.CreateDailyLogAsync(dto);
            return Ok(created);
        }

        [HttpDelete("daily/{id:guid}")]
        public async Task<IActionResult> DeleteDailyLog(Guid id)
        {
            var success = await _scrumService.DeleteDailyLogAsync(id);
            return success ? NoContent() : NotFound();
        }

        #endregion

        #region Retrospective

        [HttpGet("retrospective/{sprintId:guid}")]
        public async Task<IActionResult> GetRetrospective(Guid sprintId)
        {
            var retro = await _scrumService.GetRetrospectiveAsync(sprintId);
            return Ok(retro);
        }

        [HttpPost("retrospective/{sprintId:guid}")]
        public async Task<IActionResult> SaveRetrospective(Guid sprintId, [FromBody] SaveSprintRetrospectiveDto dto)
        {
            var saved = await _scrumService.SaveRetrospectiveAsync(sprintId, dto);
            return Ok(saved);
        }

        #endregion

        #region Seed & Export

        [HttpPost("seed/{planId:guid}")]
        public async Task<IActionResult> SeedInitialData(Guid planId)
        {
            var success = await _scrumService.SeedInitialScrumDataAsync(planId);
            return success ? Ok(new { message = "Datos iniciales de SCRUM (HU-01 a HU-10 y 4 Sprints) inicializados con éxito." }) : NotFound();
        }

        [HttpGet("export-matrix/{sprintId:guid}")]
        public async Task<IActionResult> ExportMatrix(Guid sprintId)
        {
            try
            {
                var bytes = await _scrumService.ExportMatrixXlsxAsync(sprintId);
                return File(bytes, "text/csv; charset=utf-8", $"Matriz_Planificacion_Sprint_{sprintId}.csv");
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        #endregion
    }
}
