using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ProductBacklogService : IProductBacklogService
    {
        private readonly IRepository<UserStory> _userStoryRepository;
        private readonly IRepository<TestPlan> _testPlanRepository;
        private readonly IMapper _mapper;

        public ProductBacklogService(
            IRepository<UserStory> userStoryRepository,
            IRepository<TestPlan> testPlanRepository,
            IMapper mapper)
        {
            _userStoryRepository = userStoryRepository;
            _testPlanRepository = testPlanRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserStoryDto>> GetByPlanAsync(
            Guid testPlanId,
            string? search = null,
            string? priority = null,
            string? status = null,
            string? sortBy = null)
        {
            var stories = (await _userStoryRepository.GetAllWithIncludesAsync(x => x.Sprint, x => x.Tasks))
                .Where(x => x.TestPlanId == testPlanId);

            // Búsqueda textual
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.Trim().ToLowerInvariant();
                stories = stories.Where(x =>
                    x.StoryCode.ToLowerInvariant().Contains(searchLower) ||
                    x.Title.ToLowerInvariant().Contains(searchLower) ||
                    x.Description.ToLowerInvariant().Contains(searchLower) ||
                    x.Origin.ToLowerInvariant().Contains(searchLower) ||
                    x.AcceptanceCriteria.ToLowerInvariant().Contains(searchLower));
            }

            // Filtro por prioridad
            if (!string.IsNullOrWhiteSpace(priority) && priority != "All" && priority != "Todas")
            {
                stories = stories.Where(x => x.Priority.Equals(priority, StringComparison.OrdinalIgnoreCase));
            }

            // Filtro por estado
            if (!string.IsNullOrWhiteSpace(status) && status != "All" && status != "Todos")
            {
                stories = stories.Where(x => x.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
            }

            // Ordenación
            stories = (sortBy?.ToLowerInvariant()) switch
            {
                "priority" or "prioridad" => stories.OrderBy(x => x.Priority == "Alta" ? 1 : x.Priority == "Media" ? 2 : 3),
                "effort" or "esfuerzo" => stories.OrderByDescending(x => x.EffortEstimation),
                "code" or "codigo" => stories.OrderBy(x => x.StoryCode),
                "title" or "titulo" => stories.OrderBy(x => x.Title),
                _ => stories.OrderByDescending(x => x.CreatedAt)
            };

            return _mapper.Map<IEnumerable<UserStoryDto>>(stories.ToList());
        }

        public async Task<UserStoryDto?> GetByIdAsync(Guid id)
        {
            var story = await _userStoryRepository.GetByIdWithIncludesAsync(id, x => x.Sprint, x => x.Tasks);
            return story == null ? null : _mapper.Map<UserStoryDto>(story);
        }

        public async Task<UserStoryDto> CreateAsync(CreateUserStoryDto dto)
        {
            var plan = await _testPlanRepository.GetByIdAsync(dto.TestPlanId);
            if (plan == null)
                throw new ArgumentException("El Plan de Prueba especificado no existe.");

            // Si el StoryCode no se proporcionó o es genérico, calcular siguiente código US-X
            var storyCode = dto.StoryCode;
            if (string.IsNullOrWhiteSpace(storyCode))
            {
                var existingCount = (await _userStoryRepository.GetAllAsync())
                    .Count(x => x.TestPlanId == dto.TestPlanId);
                storyCode = $"US-{(existingCount + 1):D2}";
            }

            var story = new UserStory
            {
                Id = Guid.NewGuid(),
                TestPlanId = dto.TestPlanId,
                SprintId = dto.SprintId,
                StoryCode = storyCode,
                Title = dto.Title,
                Description = dto.Description,
                Priority = string.IsNullOrWhiteSpace(dto.Priority) ? "Media" : dto.Priority,
                EffortEstimation = dto.EffortEstimation > 0 ? dto.EffortEstimation : 3,
                Origin = dto.Origin ?? string.Empty,
                FindingId = dto.FindingId,
                Status = dto.SprintId.HasValue ? "InSprint" : "Backlog",
                AcceptanceCriteria = JsonSerializer.Serialize(dto.AcceptanceCriteria ?? new List<string>())
            };

            var created = await _userStoryRepository.AddAsync(story);
            return await GetByIdAsync(created.Id) ?? _mapper.Map<UserStoryDto>(created);
        }

        public async Task<UserStoryDto> UpdateAsync(Guid id, UpdateUserStoryDto dto)
        {
            var story = await _userStoryRepository.GetByIdWithIncludesAsync(id, x => x.Sprint, x => x.Tasks);
            if (story == null)
                throw new KeyNotFoundException($"Historia de usuario {id} no encontrada.");

            story.Title = dto.Title;
            story.Description = dto.Description;
            story.Priority = dto.Priority;
            story.EffortEstimation = dto.EffortEstimation;
            story.Origin = dto.Origin;
            story.FindingId = dto.FindingId;
            story.Status = dto.Status;
            story.SprintId = dto.SprintId;
            story.AcceptanceCriteria = JsonSerializer.Serialize(dto.AcceptanceCriteria ?? new List<string>());

            await _userStoryRepository.UpdateAsync(story);
            return await GetByIdAsync(id) ?? _mapper.Map<UserStoryDto>(story);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var story = await _userStoryRepository.GetByIdAsync(id);
            if (story == null) return false;

            await _userStoryRepository.DeleteAsync(id);
            return true;
        }

        public async Task<IEnumerable<UserStoryDto>> ImportApprovedStoriesAsync(Guid testPlanId, List<CreateUserStoryDto> stories)
        {
            var plan = await _testPlanRepository.GetByIdAsync(testPlanId);
            if (plan == null)
                throw new ArgumentException("El Plan de Prueba especificado no existe.");

            var createdStories = new List<UserStoryDto>();
            var existingStories = (await _userStoryRepository.GetAllAsync())
                .Where(x => x.TestPlanId == testPlanId)
                .ToList();
            int currentCount = existingStories.Count;

            foreach (var item in stories)
            {
                currentCount++;
                var code = string.IsNullOrWhiteSpace(item.StoryCode) ? $"US-{currentCount:D2}" : item.StoryCode;

                var userStory = new UserStory
                {
                    Id = Guid.NewGuid(),
                    TestPlanId = testPlanId,
                    SprintId = item.SprintId,
                    StoryCode = code,
                    Title = item.Title,
                    Description = item.Description,
                    Priority = string.IsNullOrWhiteSpace(item.Priority) ? "Alta" : item.Priority,
                    EffortEstimation = item.EffortEstimation > 0 ? item.EffortEstimation : 5,
                    Origin = item.Origin ?? "Propuesta de IA (Observaciones / Hallazgos)",
                    FindingId = item.FindingId,
                    Status = "Backlog",
                    AcceptanceCriteria = JsonSerializer.Serialize(item.AcceptanceCriteria ?? new List<string>())
                };

                var created = await _userStoryRepository.AddAsync(userStory);
                createdStories.Add(_mapper.Map<UserStoryDto>(created));
            }

            return createdStories;
        }
    }
}
