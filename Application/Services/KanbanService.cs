using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class KanbanService : IKanbanService
    {
        private readonly IRepository<SprintTask> _taskRepository;
        private readonly IRepository<Sprint> _sprintRepository;
        private readonly IRepository<UserStory> _storyRepository;
        private readonly IMapper _mapper;

        public KanbanService(
            IRepository<SprintTask> taskRepository,
            IRepository<Sprint> sprintRepository,
            IRepository<UserStory> storyRepository,
            IMapper mapper)
        {
            _taskRepository = taskRepository;
            _sprintRepository = sprintRepository;
            _storyRepository = storyRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SprintTaskDto>> GetTasksBySprintAsync(Guid sprintId)
        {
            var tasks = (await _taskRepository.GetAllWithIncludesAsync(x => x.UserStory))
                .Where(x => x.SprintId == sprintId)
                .OrderBy(x => x.Order)
                .ThenBy(x => x.CreatedAt)
                .ToList();

            return _mapper.Map<IEnumerable<SprintTaskDto>>(tasks);
        }

        public async Task<SprintTaskDto?> GetTaskByIdAsync(Guid id)
        {
            var task = await _taskRepository.GetByIdWithIncludesAsync(id, x => x.UserStory);
            return task == null ? null : _mapper.Map<SprintTaskDto>(task);
        }

        public async Task<SprintTaskDto> CreateTaskAsync(CreateSprintTaskDto dto)
        {
            var sprint = await _sprintRepository.GetByIdAsync(dto.SprintId);
            if (sprint == null)
                throw new ArgumentException("El Sprint especificado no existe.");

            var taskCode = dto.TaskCode;
            if (string.IsNullOrWhiteSpace(taskCode))
            {
                var existingCount = (await _taskRepository.GetAllAsync())
                    .Count(x => x.SprintId == dto.SprintId);
                taskCode = $"TSK-{(existingCount + 1):D2}";
            }

            var task = new SprintTask
            {
                Id = Guid.NewGuid(),
                SprintId = dto.SprintId,
                UserStoryId = dto.UserStoryId,
                TaskCode = taskCode,
                Title = dto.Title,
                Description = dto.Description ?? string.Empty,
                EstimatedHours = dto.EstimatedHours > 0 ? dto.EstimatedHours : 4,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pendiente" : dto.Status,
                Assignee = string.IsNullOrWhiteSpace(dto.Assignee) ? "Sin asignar" : dto.Assignee,
                Order = dto.Order
            };

            var created = await _taskRepository.AddAsync(task);
            return await GetTaskByIdAsync(created.Id) ?? _mapper.Map<SprintTaskDto>(created);
        }

        public async Task<SprintTaskDto> UpdateTaskAsync(Guid id, UpdateSprintTaskDto dto)
        {
            var task = await _taskRepository.GetByIdWithIncludesAsync(id, x => x.UserStory);
            if (task == null)
                throw new KeyNotFoundException($"Tarea {id} no encontrada.");

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.EstimatedHours = dto.EstimatedHours;
            task.Status = dto.Status;
            task.Assignee = string.IsNullOrWhiteSpace(dto.Assignee) ? "Sin asignar" : dto.Assignee;
            task.Order = dto.Order;
            if (dto.UserStoryId.HasValue)
            {
                task.UserStoryId = dto.UserStoryId.Value;
            }

            await _taskRepository.UpdateAsync(task);
            return await GetTaskByIdAsync(id) ?? _mapper.Map<SprintTaskDto>(task);
        }

        public async Task<bool> UpdateTaskStatusAsync(Guid id, string newStatus)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null) return false;

            // Validar estados admitidos
            var validStatuses = new[] { "Pendiente", "En progreso", "En revisión", "Terminado" };
            if (!validStatuses.Contains(newStatus))
            {
                // Mapear variantes comunes
                newStatus = newStatus.ToLowerInvariant() switch
                {
                    "todo" or "pending" or "pendiente" => "Pendiente",
                    "inprogress" or "in-progress" or "en progreso" or "progreso" => "En progreso",
                    "inreview" or "in-review" or "en revisión" or "revision" or "en revision" => "En revisión",
                    "done" or "completed" or "terminado" => "Terminado",
                    _ => "Pendiente"
                };
            }

            task.Status = newStatus;
            await _taskRepository.UpdateAsync(task);
            return true;
        }

        public async Task<bool> UpdateTaskAssigneeAsync(Guid id, string assignee)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null) return false;

            task.Assignee = string.IsNullOrWhiteSpace(assignee) ? "Sin asignar" : assignee.Trim();
            await _taskRepository.UpdateAsync(task);
            return true;
        }

        public async Task<bool> DeleteTaskAsync(Guid id)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null) return false;

            await _taskRepository.DeleteAsync(id);
            return true;
        }

        public async Task<IEnumerable<TeamMemberProgressDto>> GetTeamProgressAsync(Guid sprintId)
        {
            var tasks = (await _taskRepository.GetAllAsync())
                .Where(x => x.SprintId == sprintId)
                .ToList();

            var groups = tasks.GroupBy(t => string.IsNullOrWhiteSpace(t.Assignee) ? "Sin asignar" : t.Assignee);

            var list = new List<TeamMemberProgressDto>();
            foreach (var g in groups)
            {
                var memberTasks = g.ToList();
                list.Add(new TeamMemberProgressDto(
                    Assignee: g.Key,
                    TotalTasks: memberTasks.Count,
                    CompletedTasks: memberTasks.Count(t => t.Status == "Terminado"),
                    InProgressTasks: memberTasks.Count(t => t.Status == "En progreso" || t.Status == "En revisión"),
                    PendingTasks: memberTasks.Count(t => t.Status == "Pendiente"),
                    TotalEstimatedHours: memberTasks.Sum(t => t.EstimatedHours),
                    CompletedHours: memberTasks.Where(t => t.Status == "Terminado").Sum(t => t.EstimatedHours)
                ));
            }

            return list.OrderByDescending(x => x.TotalTasks);
        }
    }
}
