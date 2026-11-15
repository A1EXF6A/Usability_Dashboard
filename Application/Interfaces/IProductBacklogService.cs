using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IProductBacklogService
    {
        Task<IEnumerable<UserStoryDto>> GetByPlanAsync(Guid testPlanId, string? search = null, string? priority = null, string? status = null, string? sortBy = null);
        Task<UserStoryDto?> GetByIdAsync(Guid id);
        Task<UserStoryDto> CreateAsync(CreateUserStoryDto dto);
        Task<UserStoryDto> UpdateAsync(Guid id, UpdateUserStoryDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<UserStoryDto>> ImportApprovedStoriesAsync(Guid testPlanId, List<CreateUserStoryDto> stories);
    }
}
