using Application.DTOs;
using System;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IRetrospectiveService
    {
        Task<SprintRetrospectiveDto?> GetBySprintAsync(Guid sprintId);
        Task<SprintRetrospectiveDto> SaveAsync(SaveRetrospectiveDto dto);
    }
}
