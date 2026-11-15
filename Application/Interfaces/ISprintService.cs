using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ISprintService
    {
        Task<IEnumerable<SprintDto>> GetByPlanAsync(Guid testPlanId);
        Task<SprintDto?> GetByIdAsync(Guid id);
        Task<SprintDto> CreateAsync(CreateSprintDto dto);
        Task<SprintDto> UpdateAsync(Guid id, UpdateSprintDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> AssignStoryToSprintAsync(Guid sprintId, Guid storyId);
        Task<bool> RemoveStoryFromSprintAsync(Guid storyId);
    }
}
