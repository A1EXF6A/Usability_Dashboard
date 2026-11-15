using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IScrumService
    {
        // Backlog (Historias de Usuario)
        Task<List<UserStoryDto>> GetBacklogByPlanAsync(Guid planId);
        Task<UserStoryDto?> GetUserStoryByIdAsync(Guid id);
        Task<UserStoryDto> CreateUserStoryAsync(CreateUserStoryDto dto);
        Task<UserStoryDto> UpdateUserStoryAsync(Guid id, UpdateUserStoryDto dto);
        Task<bool> DeleteUserStoryAsync(Guid id);
        Task<List<UserStoryDto>> ReorderUserStoriesAsync(Guid planId, List<Guid> storyIds);
        Task<List<UserStoryDto>> SortBacklogByQuotientAsync(Guid planId);

        // Sprints
        Task<List<SprintDto>> GetSprintsByPlanAsync(Guid planId);
        Task<SprintDetailDto?> GetSprintDetailAsync(Guid sprintId);
        Task<SprintDto> CreateSprintAsync(CreateSprintDto dto);
        Task<SprintDto> UpdateSprintAsync(Guid id, UpdateSprintDto dto);
        Task<bool> DeleteSprintAsync(Guid id);
        Task<bool> AssignStoriesToSprintAsync(Guid sprintId, List<Guid> storyIds);

        // Tareas del sprint (Kanban)
        Task<List<SprintTaskDto>> GetTasksBySprintAsync(Guid sprintId);
        Task<SprintTaskDto> CreateTaskAsync(CreateSprintTaskDto dto);
        Task<SprintTaskDto> UpdateTaskAsync(Guid id, UpdateSprintTaskDto dto);
        Task<SprintTaskDto> UpdateTaskStatusAsync(Guid id, string newStatus);
        Task<bool> DeleteTaskAsync(Guid id);

        // Tareas No Planificadas (TNP)
        Task<List<UnplannedTaskDto>> GetUnplannedTasksBySprintAsync(Guid sprintId);
        Task<UnplannedTaskDto> CreateUnplannedTaskAsync(CreateUnplannedTaskDto dto);
        Task<bool> DeleteUnplannedTaskAsync(Guid id);

        // Daily Log
        Task<List<DailyLogDto>> GetDailyLogsBySprintAsync(Guid sprintId);
        Task<DailyLogDto> CreateDailyLogAsync(CreateDailyLogDto dto);
        Task<bool> DeleteDailyLogAsync(Guid id);

        // Sprint Retrospective
        Task<SprintRetrospectiveDto?> GetRetrospectiveAsync(Guid sprintId);
        Task<SprintRetrospectiveDto> SaveRetrospectiveAsync(Guid sprintId, SaveSprintRetrospectiveDto dto);

        // Seed inicial con historias HU-01 a HU-10 y 4 Sprints
        Task<bool> SeedInitialScrumDataAsync(Guid planId);

        // Exportación de la matriz Excel
        Task<byte[]> ExportMatrixXlsxAsync(Guid sprintId);
    }
}
