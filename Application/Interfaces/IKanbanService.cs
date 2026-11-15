using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IKanbanService
    {
        Task<IEnumerable<SprintTaskDto>> GetTasksBySprintAsync(Guid sprintId);
        Task<SprintTaskDto?> GetTaskByIdAsync(Guid id);
        Task<SprintTaskDto> CreateTaskAsync(CreateSprintTaskDto dto);
        Task<SprintTaskDto> UpdateTaskAsync(Guid id, UpdateSprintTaskDto dto);
        Task<bool> UpdateTaskStatusAsync(Guid id, string newStatus);
        Task<bool> UpdateTaskAssigneeAsync(Guid id, string assignee);
        Task<bool> DeleteTaskAsync(Guid id);
        Task<IEnumerable<TeamMemberProgressDto>> GetTeamProgressAsync(Guid sprintId);
    }
}
