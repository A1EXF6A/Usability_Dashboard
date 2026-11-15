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
    public class SprintService : ISprintService
    {
        private readonly IRepository<Sprint> _sprintRepository;
        private readonly IRepository<UserStory> _userStoryRepository;
        private readonly IRepository<TestPlan> _testPlanRepository;
        private readonly IMapper _mapper;

        public SprintService(
            IRepository<Sprint> sprintRepository,
            IRepository<UserStory> userStoryRepository,
            IRepository<TestPlan> testPlanRepository,
            IMapper mapper)
        {
            _sprintRepository = sprintRepository;
            _userStoryRepository = userStoryRepository;
            _testPlanRepository = testPlanRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SprintDto>> GetByPlanAsync(Guid testPlanId)
        {
            var sprints = (await _sprintRepository.GetAllWithIncludesAsync(
                x => x.UserStories,
                x => x.Tasks
            ))
            .Where(x => x.TestPlanId == testPlanId)
            .OrderByDescending(x => x.StartDate)
            .ToList();

            return _mapper.Map<IEnumerable<SprintDto>>(sprints);
        }

        public async Task<SprintDto?> GetByIdAsync(Guid id)
        {
            var sprint = await _sprintRepository.GetByIdWithIncludesAsync(
                id,
                x => x.UserStories,
                x => x.Tasks
            );

            return sprint == null ? null : _mapper.Map<SprintDto>(sprint);
        }

        public async Task<SprintDto> CreateAsync(CreateSprintDto dto)
        {
            var plan = await _testPlanRepository.GetByIdAsync(dto.TestPlanId);
            if (plan == null)
                throw new ArgumentException("El Plan de Prueba especificado no existe.");

            var sprint = new Sprint
            {
                Id = Guid.NewGuid(),
                TestPlanId = dto.TestPlanId,
                Name = dto.Name,
                Goal = dto.Goal,
                StartDate = dto.StartDate.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc) : dto.StartDate,
                EndDate = dto.EndDate.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc) : dto.EndDate,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Planificado" : dto.Status
            };

            var created = await _sprintRepository.AddAsync(sprint);
            return await GetByIdAsync(created.Id) ?? _mapper.Map<SprintDto>(created);
        }

        public async Task<SprintDto> UpdateAsync(Guid id, UpdateSprintDto dto)
        {
            var sprint = await _sprintRepository.GetByIdWithIncludesAsync(id, x => x.UserStories, x => x.Tasks);
            if (sprint == null)
                throw new KeyNotFoundException($"Sprint {id} no encontrado.");

            sprint.Name = dto.Name;
            sprint.Goal = dto.Goal;
            sprint.StartDate = dto.StartDate.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc) : dto.StartDate;
            sprint.EndDate = dto.EndDate.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc) : dto.EndDate;
            sprint.Status = dto.Status;

            await _sprintRepository.UpdateAsync(sprint);
            return await GetByIdAsync(id) ?? _mapper.Map<SprintDto>(sprint);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var sprint = await _sprintRepository.GetByIdWithIncludesAsync(id, x => x.UserStories);
            if (sprint == null) return false;

            // Desasignar historias para devolverlas al Product Backlog
            foreach (var story in sprint.UserStories)
            {
                story.SprintId = null;
                story.Status = "Backlog";
                await _userStoryRepository.UpdateAsync(story);
            }

            await _sprintRepository.DeleteAsync(id);
            return true;
        }

        public async Task<bool> AssignStoryToSprintAsync(Guid sprintId, Guid storyId)
        {
            var sprint = await _sprintRepository.GetByIdAsync(sprintId);
            if (sprint == null) return false;

            var story = await _userStoryRepository.GetByIdAsync(storyId);
            if (story == null) return false;

            story.SprintId = sprintId;
            story.Status = "InSprint";
            await _userStoryRepository.UpdateAsync(story);

            return true;
        }

        public async Task<bool> RemoveStoryFromSprintAsync(Guid storyId)
        {
            var story = await _userStoryRepository.GetByIdAsync(storyId);
            if (story == null) return false;

            story.SprintId = null;
            story.Status = "Backlog";
            await _userStoryRepository.UpdateAsync(story);

            return true;
        }
    }
}
