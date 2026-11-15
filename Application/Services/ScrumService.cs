using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ScrumService : IScrumService
    {
        private readonly IRepository<TestPlan> _planRepo;
        private readonly IRepository<UserStory> _storyRepo;
        private readonly IRepository<Sprint> _sprintRepo;
        private readonly IRepository<SprintTask> _taskRepo;
        private readonly IRepository<UnplannedTask> _unplannedRepo;
        private readonly IRepository<DailyLog> _dailyRepo;
        private readonly IRepository<SprintRetrospective> _retroRepo;
        private readonly IRepository<Finding> _findingRepo;
        private readonly IMapper _mapper;

        public ScrumService(
            IRepository<TestPlan> planRepo,
            IRepository<UserStory> storyRepo,
            IRepository<Sprint> sprintRepo,
            IRepository<SprintTask> taskRepo,
            IRepository<UnplannedTask> unplannedRepo,
            IRepository<DailyLog> dailyRepo,
            IRepository<SprintRetrospective> retroRepo,
            IRepository<Finding> findingRepo,
            IMapper mapper)
        {
            _planRepo = planRepo;
            _storyRepo = storyRepo;
            _sprintRepo = sprintRepo;
            _taskRepo = taskRepo;
            _unplannedRepo = unplannedRepo;
            _dailyRepo = dailyRepo;
            _retroRepo = retroRepo;
            _findingRepo = findingRepo;
            _mapper = mapper;
        }

        #region Backlog / User Stories

        public async Task<List<UserStoryDto>> GetBacklogByPlanAsync(Guid planId)
        {
            var stories = (await _storyRepo.GetAllWithIncludesAsync(s => s.Finding, s => s.Sprint, s => s.Tasks))
                .Where(s => s.TestPlanId == planId)
                .OrderBy(s => s.PriorityOrder)
                .ThenByDescending(s => s.DecisionQuotient)
                .ToList();

            return _mapper.Map<List<UserStoryDto>>(stories);
        }

        public async Task<UserStoryDto?> GetUserStoryByIdAsync(Guid id)
        {
            var story = await _storyRepo.GetByIdWithIncludesAsync(id, s => s.Finding, s => s.Sprint, s => s.Tasks);
            if (story == null) return null;
            return _mapper.Map<UserStoryDto>(story);
        }

        public async Task<UserStoryDto> CreateUserStoryAsync(CreateUserStoryDto dto)
        {
            var story = _mapper.Map<UserStory>(dto);
            story.Id = Guid.NewGuid();
            story.DecisionQuotient = story.StoryPoints > 0 
                ? Math.Round(story.BusinessValue / story.StoryPoints, 2) 
                : 0;

            if (story.PriorityOrder <= 0)
            {
                var existing = (await _storyRepo.GetAllAsync()).Where(s => s.TestPlanId == dto.TestPlanId).ToList();
                story.PriorityOrder = existing.Any() ? existing.Max(s => s.PriorityOrder) + 1 : 1;
            }

            var created = await _storyRepo.AddAsync(story);
            return await GetUserStoryByIdAsync(created.Id) ?? _mapper.Map<UserStoryDto>(created);
        }

        public async Task<UserStoryDto> UpdateUserStoryAsync(Guid id, UpdateUserStoryDto dto)
        {
            var story = await _storyRepo.GetByIdAsync(id);
            if (story == null) throw new ArgumentException("Historia de usuario no encontrada.");

            story.Code = dto.Code;
            story.Title = dto.Title;
            story.Description = dto.Description;
            story.Module = dto.Module;
            story.BusinessValue = dto.BusinessValue;
            story.StoryPoints = dto.StoryPoints;
            story.DecisionQuotient = story.StoryPoints > 0 
                ? Math.Round(story.BusinessValue / story.StoryPoints, 2) 
                : 0;
            story.PriorityOrder = dto.PriorityOrder;
            story.Priority = dto.Priority;
            story.Status = dto.Status;
            story.AcceptanceCriteria = dto.AcceptanceCriteria;
            story.FindingId = dto.FindingId;
            story.SprintId = dto.SprintId;

            await _storyRepo.UpdateAsync(story);
            return await GetUserStoryByIdAsync(id) ?? _mapper.Map<UserStoryDto>(story);
        }

        public async Task<bool> DeleteUserStoryAsync(Guid id)
        {
            var story = await _storyRepo.GetByIdAsync(id);
            if (story == null) return false;
            await _storyRepo.DeleteAsync(id);
            return true;
        }

        public async Task<List<UserStoryDto>> ReorderUserStoriesAsync(Guid planId, List<Guid> storyIds)
        {
            var stories = (await _storyRepo.GetAllAsync())
                .Where(s => s.TestPlanId == planId)
                .ToList();

            int order = 1;
            foreach (var id in storyIds)
            {
                var story = stories.FirstOrDefault(s => s.Id == id);
                if (story != null)
                {
                    story.PriorityOrder = order++;
                    await _storyRepo.UpdateAsync(story);
                }
            }

            return await GetBacklogByPlanAsync(planId);
        }

        public async Task<List<UserStoryDto>> SortBacklogByQuotientAsync(Guid planId)
        {
            var stories = (await _storyRepo.GetAllAsync())
                .Where(s => s.TestPlanId == planId)
                .OrderByDescending(s => s.DecisionQuotient)
                .ThenByDescending(s => s.BusinessValue)
                .ToList();

            int order = 1;
            foreach (var s in stories)
            {
                s.PriorityOrder = order++;
                await _storyRepo.UpdateAsync(s);
            }

            return await GetBacklogByPlanAsync(planId);
        }

        #endregion

        #region Sprints

        public async Task<List<SprintDto>> GetSprintsByPlanAsync(Guid planId)
        {
            var sprints = (await _sprintRepo.GetAllWithIncludesAsync(
                s => s.UserStories, 
                s => s.Tasks, 
                s => s.UnplannedTasks))
                .Where(s => s.TestPlanId == planId)
                .OrderBy(s => s.SprintNumber)
                .ToList();

            return _mapper.Map<List<SprintDto>>(sprints);
        }

        public async Task<SprintDetailDto?> GetSprintDetailAsync(Guid sprintId)
        {
            var sprint = (await _sprintRepo.GetAllWithIncludesAsync(
                s => s.UserStories,
                s => s.Tasks,
                s => s.UnplannedTasks,
                s => s.DailyLogs,
                s => s.Retrospective))
                .FirstOrDefault(s => s.Id == sprintId);

            if (sprint == null) return null;

            var detail = _mapper.Map<SprintDetailDto>(sprint);
            
            // Map task story codes
            foreach (var task in detail.Tasks)
            {
                if (task.UserStoryId.HasValue)
                {
                    var story = sprint.UserStories.FirstOrDefault(u => u.Id == task.UserStoryId.Value);
                    if (story != null)
                    {
                        task.UserStoryCode = story.Code;
                        task.UserStoryTitle = story.Title;
                    }
                }
            }

            return detail;
        }

        public async Task<SprintDto> CreateSprintAsync(CreateSprintDto dto)
        {
            var sprint = _mapper.Map<Sprint>(dto);
            sprint.Id = Guid.NewGuid();
            
            if (sprint.TotalCapacityHours <= 0)
            {
                // Cálculo de capacidad: 4 miembros * 2 horas/día * 8 días hábiles por sprint = 64 horas
                sprint.TotalCapacityHours = sprint.DailyHoursPerMember * sprint.SprintWeeksCount * 4 * 4;
            }

            var created = await _sprintRepo.AddAsync(sprint);
            return _mapper.Map<SprintDto>(created);
        }

        public async Task<SprintDto> UpdateSprintAsync(Guid id, UpdateSprintDto dto)
        {
            var sprint = await _sprintRepo.GetByIdAsync(id);
            if (sprint == null) throw new ArgumentException("Sprint no encontrado.");

            sprint.SprintNumber = dto.SprintNumber;
            sprint.Name = dto.Name;
            sprint.Goal = dto.Goal;
            sprint.Weeks = dto.Weeks;
            sprint.StartDate = dto.StartDate;
            sprint.EndDate = dto.EndDate;
            sprint.ProductOwner = dto.ProductOwner;
            sprint.ScrumMaster = dto.ScrumMaster;
            sprint.DailyHoursPerMember = dto.DailyHoursPerMember;
            sprint.WeeklyHoursPerMember = dto.WeeklyHoursPerMember;
            sprint.SprintWeeksCount = dto.SprintWeeksCount;
            sprint.TotalCapacityHours = dto.TotalCapacityHours;
            sprint.TeamMembersJson = dto.TeamMembersJson;
            sprint.Status = dto.Status;

            await _sprintRepo.UpdateAsync(sprint);
            return _mapper.Map<SprintDto>(sprint);
        }

        public async Task<bool> DeleteSprintAsync(Guid id)
        {
            var sprint = await _sprintRepo.GetByIdAsync(id);
            if (sprint == null) return false;
            await _sprintRepo.DeleteAsync(id);
            return true;
        }

        public async Task<bool> AssignStoriesToSprintAsync(Guid sprintId, List<Guid> storyIds)
        {
            var sprint = await _sprintRepo.GetByIdAsync(sprintId);
            if (sprint == null) return false;

            var stories = (await _storyRepo.GetAllAsync())
                .Where(s => s.TestPlanId == sprint.TestPlanId)
                .ToList();

            foreach (var story in stories)
            {
                if (storyIds.Contains(story.Id))
                {
                    story.SprintId = sprintId;
                    if (story.Status == "Backlog") story.Status = "Asignada";
                    await _storyRepo.UpdateAsync(story);
                }
                else if (story.SprintId == sprintId)
                {
                    story.SprintId = null;
                    if (story.Status == "Asignada") story.Status = "Backlog";
                    await _storyRepo.UpdateAsync(story);
                }
            }

            return true;
        }

        #endregion

        #region Tasks (Kanban)

        public async Task<List<SprintTaskDto>> GetTasksBySprintAsync(Guid sprintId)
        {
            var tasks = (await _taskRepo.GetAllWithIncludesAsync(t => t.UserStory))
                .Where(t => t.SprintId == sprintId)
                .OrderBy(t => t.CreatedAt)
                .ToList();

            return _mapper.Map<List<SprintTaskDto>>(tasks);
        }

        public async Task<SprintTaskDto> CreateTaskAsync(CreateSprintTaskDto dto)
        {
            var task = _mapper.Map<SprintTask>(dto);
            task.Id = Guid.NewGuid();
            var created = await _taskRepo.AddAsync(task);

            var withStory = await _taskRepo.GetByIdWithIncludesAsync(created.Id, t => t.UserStory);
            return _mapper.Map<SprintTaskDto>(withStory ?? created);
        }

        public async Task<SprintTaskDto> UpdateTaskAsync(Guid id, UpdateSprintTaskDto dto)
        {
            var task = await _taskRepo.GetByIdAsync(id);
            if (task == null) throw new ArgumentException("Tarea no encontrada.");

            task.UserStoryId = dto.UserStoryId;
            task.Title = dto.Title;
            task.Developer = dto.Developer;
            task.Phase = dto.Phase;
            task.Type = dto.Type;
            task.EstimatedHours = dto.EstimatedHours;
            task.RealHours = dto.RealHours;
            task.Status = dto.Status;
            task.Comment = dto.Comment;

            await _taskRepo.UpdateAsync(task);
            var withStory = await _taskRepo.GetByIdWithIncludesAsync(id, t => t.UserStory);
            return _mapper.Map<SprintTaskDto>(withStory ?? task);
        }

        public async Task<SprintTaskDto> UpdateTaskStatusAsync(Guid id, string newStatus)
        {
            var task = await _taskRepo.GetByIdAsync(id);
            if (task == null) throw new ArgumentException("Tarea no encontrada.");

            task.Status = newStatus;
            await _taskRepo.UpdateAsync(task);

            var withStory = await _taskRepo.GetByIdWithIncludesAsync(id, t => t.UserStory);
            return _mapper.Map<SprintTaskDto>(withStory ?? task);
        }

        public async Task<bool> DeleteTaskAsync(Guid id)
        {
            var task = await _taskRepo.GetByIdAsync(id);
            if (task == null) return false;
            await _taskRepo.DeleteAsync(id);
            return true;
        }

        #endregion

        #region Tareas No Planificadas (TNP)

        public async Task<List<UnplannedTaskDto>> GetUnplannedTasksBySprintAsync(Guid sprintId)
        {
            var list = (await _unplannedRepo.GetAllAsync())
                .Where(u => u.SprintId == sprintId)
                .OrderBy(u => u.Date)
                .ToList();

            return _mapper.Map<List<UnplannedTaskDto>>(list);
        }

        public async Task<UnplannedTaskDto> CreateUnplannedTaskAsync(CreateUnplannedTaskDto dto)
        {
            var task = _mapper.Map<UnplannedTask>(dto);
            task.Id = Guid.NewGuid();
            var created = await _unplannedRepo.AddAsync(task);
            return _mapper.Map<UnplannedTaskDto>(created);
        }

        public async Task<bool> DeleteUnplannedTaskAsync(Guid id)
        {
            var task = await _unplannedRepo.GetByIdAsync(id);
            if (task == null) return false;
            await _unplannedRepo.DeleteAsync(id);
            return true;
        }

        #endregion

        #region Daily Log

        public async Task<List<DailyLogDto>> GetDailyLogsBySprintAsync(Guid sprintId)
        {
            var logs = (await _dailyRepo.GetAllAsync())
                .Where(d => d.SprintId == sprintId)
                .OrderByDescending(d => d.Date)
                .ToList();

            return _mapper.Map<List<DailyLogDto>>(logs);
        }

        public async Task<DailyLogDto> CreateDailyLogAsync(CreateDailyLogDto dto)
        {
            var log = _mapper.Map<DailyLog>(dto);
            log.Id = Guid.NewGuid();
            var created = await _dailyRepo.AddAsync(log);
            return _mapper.Map<DailyLogDto>(created);
        }

        public async Task<bool> DeleteDailyLogAsync(Guid id)
        {
            var log = await _dailyRepo.GetByIdAsync(id);
            if (log == null) return false;
            await _dailyRepo.DeleteAsync(id);
            return true;
        }

        #endregion

        #region Sprint Retrospective

        public async Task<SprintRetrospectiveDto?> GetRetrospectiveAsync(Guid sprintId)
        {
            var retro = (await _retroRepo.GetAllAsync())
                .FirstOrDefault(r => r.SprintId == sprintId);

            if (retro == null) return null;
            return _mapper.Map<SprintRetrospectiveDto>(retro);
        }

        public async Task<SprintRetrospectiveDto> SaveRetrospectiveAsync(Guid sprintId, SaveSprintRetrospectiveDto dto)
        {
            var existing = (await _retroRepo.GetAllAsync())
                .FirstOrDefault(r => r.SprintId == sprintId);

            if (existing != null)
            {
                existing.WhatWentWell = dto.WhatWentWell;
                existing.WhatWentWrong = dto.WhatWentWrong;
                existing.CompletedSummary = dto.CompletedSummary;
                existing.PendingSummary = dto.PendingSummary;
                existing.Agreements = dto.Agreements;
                await _retroRepo.UpdateAsync(existing);
                return _mapper.Map<SprintRetrospectiveDto>(existing);
            }
            else
            {
                var newRetro = new SprintRetrospective
                {
                    Id = Guid.NewGuid(),
                    SprintId = sprintId,
                    WhatWentWell = dto.WhatWentWell,
                    WhatWentWrong = dto.WhatWentWrong,
                    CompletedSummary = dto.CompletedSummary,
                    PendingSummary = dto.PendingSummary,
                    Agreements = dto.Agreements
                };
                var created = await _retroRepo.AddAsync(newRetro);
                return _mapper.Map<SprintRetrospectiveDto>(created);
            }
        }

        #endregion

        #region Seed & Matrix Export

        public async Task<bool> SeedInitialScrumDataAsync(Guid planId)
        {
            var plan = await _planRepo.GetByIdAsync(planId);
            if (plan == null) return false;

            // Verificar si ya existen historias
            var existingStories = (await _storyRepo.GetAllAsync()).Where(s => s.TestPlanId == planId).ToList();
            var existingSprints = (await _sprintRepo.GetAllAsync()).Where(s => s.TestPlanId == planId).ToList();

            var findings = (await _findingRepo.GetAllAsync()).Where(f => f.TestPlanId == planId).ToList();
            var f1 = findings.FirstOrDefault(f => f.Description.Contains("buscador", StringComparison.OrdinalIgnoreCase) || f.Description.Contains("placeholder", StringComparison.OrdinalIgnoreCase));
            var f2 = findings.FirstOrDefault(f => f.Description.Contains("label", StringComparison.OrdinalIgnoreCase) || f.Description.Contains("etiqueta", StringComparison.OrdinalIgnoreCase));
            var f3 = findings.FirstOrDefault(f => f.Description.Contains("silenciosa", StringComparison.OrdinalIgnoreCase) || f.Description.Contains("inscripción", StringComparison.OrdinalIgnoreCase));
            var f4 = findings.FirstOrDefault(f => f.Description.Contains("badge", StringComparison.OrdinalIgnoreCase) || f.Description.Contains("catálogo", StringComparison.OrdinalIgnoreCase));

            // 1. Sprints si no existen
            Sprint s1, s2, s3, s4;
            if (!existingSprints.Any())
            {
                var teamJson = JsonSerializer.Serialize(new[]
                {
                    new { name = "Miembro 1 (UX/UI Dev)", hoursPerSprint = 16 },
                    new { name = "Miembro 2 (Frontend Dev)", hoursPerSprint = 16 },
                    new { name = "Miembro 3 (Backend Dev)", hoursPerSprint = 16 },
                    new { name = "Miembro 4 (QA / Accesibilidad)", hoursPerSprint = 16 }
                });

                var baseDate = new DateTime(2026, 3, 10, 0, 0, 0, DateTimeKind.Utc);

                s1 = new Sprint
                {
                    Id = Guid.NewGuid(),
                    TestPlanId = planId,
                    SprintNumber = 1,
                    Name = "Sprint 1",
                    Goal = "Diagnóstico, backlog y prototipos iniciales (Baja y media fidelidad)",
                    Weeks = "Sem. 10–11",
                    StartDate = baseDate,
                    EndDate = baseDate.AddDays(14),
                    ProductOwner = "Product Owner (IHC Team)",
                    ScrumMaster = "Scrum Master (IHC Team)",
                    DailyHoursPerMember = 2,
                    WeeklyHoursPerMember = 8,
                    SprintWeeksCount = 2,
                    TotalCapacityHours = 64,
                    TeamMembersJson = teamJson,
                    Status = "Completed"
                };
                await _sprintRepo.AddAsync(s1);

                s2 = new Sprint
                {
                    Id = Guid.NewGuid(),
                    TestPlanId = planId,
                    SprintNumber = 2,
                    Name = "Sprint 2",
                    Goal = "Prototipo de alta fidelidad e implementación base del sistema visual",
                    Weeks = "Sem. 12–13",
                    StartDate = baseDate.AddDays(14),
                    EndDate = baseDate.AddDays(28),
                    ProductOwner = "Product Owner (IHC Team)",
                    ScrumMaster = "Scrum Master (IHC Team)",
                    DailyHoursPerMember = 2,
                    WeeklyHoursPerMember = 8,
                    SprintWeeksCount = 2,
                    TotalCapacityHours = 64,
                    TeamMembersJson = teamJson,
                    Status = "Active"
                };
                await _sprintRepo.AddAsync(s2);

                s3 = new Sprint
                {
                    Id = Guid.NewGuid(),
                    TestPlanId = planId,
                    SprintNumber = 3,
                    Name = "Sprint 3",
                    Goal = "Integración de feedback, accesibilidad e IA analítica",
                    Weeks = "Sem. 14–15",
                    StartDate = baseDate.AddDays(28),
                    EndDate = baseDate.AddDays(42),
                    ProductOwner = "Product Owner (IHC Team)",
                    ScrumMaster = "Scrum Master (IHC Team)",
                    DailyHoursPerMember = 2,
                    WeeklyHoursPerMember = 8,
                    SprintWeeksCount = 2,
                    TotalCapacityHours = 64,
                    TeamMembersJson = teamJson,
                    Status = "Planned"
                };
                await _sprintRepo.AddAsync(s3);

                s4 = new Sprint
                {
                    Id = Guid.NewGuid(),
                    TestPlanId = planId,
                    SprintNumber = 4,
                    Name = "Sprint 4",
                    Goal = "Cierre, retrospectiva y sustentación final del proyecto integrador",
                    Weeks = "Sem. 16",
                    StartDate = baseDate.AddDays(42),
                    EndDate = baseDate.AddDays(49),
                    ProductOwner = "Product Owner (IHC Team)",
                    ScrumMaster = "Scrum Master (IHC Team)",
                    DailyHoursPerMember = 2,
                    WeeklyHoursPerMember = 8,
                    SprintWeeksCount = 1,
                    TotalCapacityHours = 32,
                    TeamMembersJson = teamJson,
                    Status = "Planned"
                };
                await _sprintRepo.AddAsync(s4);
            }
            else
            {
                s1 = existingSprints.FirstOrDefault(s => s.SprintNumber == 1) ?? existingSprints.First();
                s2 = existingSprints.FirstOrDefault(s => s.SprintNumber == 2) ?? s1;
                s3 = existingSprints.FirstOrDefault(s => s.SprintNumber == 3) ?? s1;
                s4 = existingSprints.FirstOrDefault(s => s.SprintNumber == 4) ?? s1;
            }

            // 2. Historias HU-01 a HU-10
            if (!existingStories.Any())
            {
                var stories = new List<UserStory>
                {
                    new() {
                        Id = Guid.NewGuid(),
                        TestPlanId = planId,
                        Code = "HU-01",
                        Title = "Registro de prueba de usabilidad",
                        Description = "Como evaluador, quiero registrar una prueba de usabilidad con tareas, tiempos y observaciones para analizar el desempeño de una interfaz.",
                        Module = "Eval.",
                        Priority = "Alta",
                        Status = "Terminada",
                        BusinessValue = 9,
                        StoryPoints = 3,
                        DecisionQuotient = 3.00m,
                        PriorityOrder = 1,
                        AcceptanceCriteria = "La prueba se guarda y puede consultarse desde el dashboard.\nPermite registrar participantes, métricas y tiempos de ejecución.",
                        SprintId = s1.Id,
                        FindingId = null
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        TestPlanId = planId,
                        Code = "HU-02",
                        Title = "Visualización de problemas más frecuentes",
                        Description = "Como usuario del dashboard, quiero visualizar los problemas más frecuentes para identificar rápidamente las principales oportunidades de mejora.",
                        Module = "Dash.",
                        Priority = "Alta",
                        Status = "Terminada",
                        BusinessValue = 8,
                        StoryPoints = 2,
                        DecisionQuotient = 4.00m,
                        PriorityOrder = 2,
                        AcceptanceCriteria = "El panel muestra conteos, categorías y filtros básicos.\nGráficos de severidad y distribución de errores interactivos.",
                        SprintId = s1.Id,
                        FindingId = f4?.Id
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        TestPlanId = planId,
                        Code = "HU-03",
                        Title = "Comparativa antes y después del rediseño",
                        Description = "Como docente, quiero comparar el antes y el después del aplicativo para verificar si el rediseño mejoró la experiencia.",
                        Module = "Dash.",
                        Priority = "Alta",
                        Status = "EnProgreso",
                        BusinessValue = 9,
                        StoryPoints = 5,
                        DecisionQuotient = 1.80m,
                        PriorityOrder = 3,
                        AcceptanceCriteria = "Existen evidencias visuales y métricas comparativas (tiempo, éxito, satisfacción).\nVista interactiva lado a lado.",
                        SprintId = s2.Id,
                        FindingId = null
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        TestPlanId = planId,
                        Code = "HU-04",
                        Title = "Resumen automático de observaciones con IA",
                        Description = "Como equipo UX, queremos que la IA resuma las observaciones textuales para acelerar la interpretación de hallazgos.",
                        Module = "IA",
                        Priority = "Alta",
                        Status = "EnProgreso",
                        BusinessValue = 9,
                        StoryPoints = 3,
                        DecisionQuotient = 3.00m,
                        PriorityOrder = 4,
                        AcceptanceCriteria = "El sistema genera un resumen legible y útil en menos de 5 segundos.\nCuenta con fallback determinista si no hay conexión externa.",
                        SprintId = s2.Id,
                        FindingId = f1?.Id
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        TestPlanId = planId,
                        Code = "HU-05",
                        Title = "Recomendaciones UX sugeridas por IA",
                        Description = "Como equipo de proyecto, queremos que la IA sugiera recomendaciones UX basadas en problemas detectados.",
                        Module = "IA",
                        Priority = "Media",
                        Status = "Asignada",
                        BusinessValue = 7,
                        StoryPoints = 3,
                        DecisionQuotient = 2.33m,
                        PriorityOrder = 5,
                        AcceptanceCriteria = "Se muestran sugerencias asociadas a cada hallazgo con justificación heurística.\nPermite convertir sugerencias en historias de usuario.",
                        SprintId = s2.Id,
                        FindingId = f3?.Id
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        TestPlanId = planId,
                        Code = "HU-06",
                        Title = "Product Backlog con cociente de decisión",
                        Description = "Como líder del equipo, quiero registrar historias de usuario en un Product Backlog para planificar el proyecto por sprints.",
                        Module = "SCRUM",
                        Priority = "Alta",
                        Status = "Terminada",
                        BusinessValue = 9,
                        StoryPoints = 3,
                        DecisionQuotient = 3.00m,
                        PriorityOrder = 6,
                        AcceptanceCriteria = "Se pueden crear, editar y priorizar historias con BV y SP.\nCálculo automático del cociente BV/SP y orden sugerido.",
                        SprintId = s1.Id,
                        FindingId = null
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        TestPlanId = planId,
                        Code = "HU-07",
                        Title = "Tablero Kanban de tareas por sprint",
                        Description = "Como integrante, quiero visualizar mis tareas en un tablero para saber qué debo hacer y en qué estado se encuentran.",
                        Module = "SCRUM",
                        Priority = "Alta",
                        Status = "EnProgreso",
                        BusinessValue = 8,
                        StoryPoints = 3,
                        DecisionQuotient = 2.67m,
                        PriorityOrder = 7,
                        AcceptanceCriteria = "El tablero muestra tareas por estado (Pendiente, En progreso, En revisión, Terminado).\nSoporta Drag & Drop y accesibilidad total por teclado.",
                        SprintId = s2.Id,
                        FindingId = null
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        TestPlanId = planId,
                        Code = "HU-08",
                        Title = "Retrospectivas de sprint y acuerdos",
                        Description = "Como equipo, queremos registrar retrospectivas para mejorar el siguiente sprint.",
                        Module = "SCRUM",
                        Priority = "Media",
                        Status = "Asignada",
                        BusinessValue = 6,
                        StoryPoints = 2,
                        DecisionQuotient = 3.00m,
                        PriorityOrder = 8,
                        AcceptanceCriteria = "Cada sprint guarda acuerdos, qué salió bien y qué salió mal.\nExportable en la matriz de planificación.",
                        SprintId = s3.Id,
                        FindingId = null
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        TestPlanId = planId,
                        Code = "HU-09",
                        Title = "Formularios comprensibles con validación",
                        Description = "Como usuario final, quiero un formulario más claro y con validación para evitar errores al registrar resultados.",
                        Module = "UI",
                        Priority = "Alta",
                        Status = "EnProgreso",
                        BusinessValue = 8,
                        StoryPoints = 4,
                        DecisionQuotient = 2.00m,
                        PriorityOrder = 9,
                        AcceptanceCriteria = "Los campos son comprensibles y muestran mensajes de ayuda en línea.\nLabels permanentes e indicadores visuales de requerimiento.",
                        SprintId = s2.Id,
                        FindingId = f2?.Id
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        TestPlanId = planId,
                        Code = "HU-10",
                        Title = "Navegación consistente y accesible",
                        Description = "Como usuario nuevo, quiero navegar por el dashboard sin confusión para aprender el sistema rápidamente.",
                        Module = "UI",
                        Priority = "Alta",
                        Status = "Terminada",
                        BusinessValue = 8,
                        StoryPoints = 3,
                        DecisionQuotient = 2.67m,
                        PriorityOrder = 10,
                        AcceptanceCriteria = "La navegación es consistente y las etiquetas son claras.\nMenú accesible con teclado, contraste WCAG AA y skip links.",
                        SprintId = s1.Id,
                        FindingId = null
                    }
                };

                foreach (var st in stories)
                {
                    await _storyRepo.AddAsync(st);
                }

                // 3. Tareas iniciales de Sprint 1 y 2
                var hu1 = stories[0];
                var hu6 = stories[5];
                var hu7 = stories[6];
                var hu9 = stories[8];

                var sampleTasks = new List<SprintTask>
                {
                    new() {
                        Id = Guid.NewGuid(),
                        SprintId = s1.Id,
                        UserStoryId = hu1.Id,
                        Title = "Análisis de entidades y modelo relacional de evaluación",
                        Developer = "Miembro 1 (UX/UI Dev)",
                        Phase = "Análisis",
                        Type = "Nuevo",
                        EstimatedHours = 4,
                        RealHours = 4,
                        Status = "Terminado",
                        Comment = "Diagrama de clases y migraciones completadas"
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        SprintId = s1.Id,
                        UserStoryId = hu6.Id,
                        Title = "Diseñar estructura de matriz Excel y Product Backlog relacional",
                        Developer = "Miembro 3 (Backend Dev)",
                        Phase = "Diseño",
                        Type = "Nuevo",
                        EstimatedHours = 6,
                        RealHours = 5,
                        Status = "Terminado",
                        Comment = "Estructura normalizada en EF Core"
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        SprintId = s2.Id,
                        UserStoryId = hu7.Id,
                        Title = "Construir componente KanbanBoard con accesibilidad y drag & drop",
                        Developer = "Miembro 2 (Frontend Dev)",
                        Phase = "Implementación",
                        Type = "Nuevo",
                        EstimatedHours = 8,
                        RealHours = 6,
                        Status = "En progreso",
                        Comment = "Columnas y botones de teclado funcionales"
                    },
                    new() {
                        Id = Guid.NewGuid(),
                        SprintId = s2.Id,
                        UserStoryId = hu9.Id,
                        Title = "Añadir validaciones accesibles en línea y prevención de errores",
                        Developer = "Miembro 4 (QA / Accesibilidad)",
                        Phase = "Pruebas",
                        Type = "Error",
                        EstimatedHours = 5,
                        RealHours = 3,
                        Status = "En revisión",
                        Comment = "Revisión con WAVE y teclado"
                    }
                };

                foreach (var t in sampleTasks)
                {
                    await _taskRepo.AddAsync(t);
                }

                // 4. TNP de muestra
                var tnp = new UnplannedTask
                {
                    Id = Guid.NewGuid(),
                    SprintId = s1.Id,
                    Date = DateTime.UtcNow.AddDays(-10),
                    Developer = "Miembro 3 (Backend Dev)",
                    TaskDescription = "Ajustar permisos de red y puerto Postgres en docker-compose",
                    DurationHours = 2
                };
                await _unplannedRepo.AddAsync(tnp);

                // 5. Retrospectiva de Sprint 1
                var retro1 = new SprintRetrospective
                {
                    Id = Guid.NewGuid(),
                    SprintId = s1.Id,
                    WhatWentWell = "Excelente sinergia en la definición de la arquitectura de información y el diagnóstico de usabilidad.",
                    WhatWentWrong = "La matriz Excel original requería normalización para modelarse adecuadamente en bases relacionales.",
                    CompletedSummary = "Se completaron las historias HU-01, HU-02, HU-06 y HU-10 dentro del tiempo previsto.",
                    PendingSummary = "Quedaron pendientes pruebas heurísticas automatizadas con Lighthouse.",
                    Agreements = "Priorizar accesibilidad y validaciones en línea en el siguiente sprint para evitar deuda técnica."
                };
                await _retroRepo.AddAsync(retro1);
            }

            return true;
        }

        public async Task<byte[]> ExportMatrixXlsxAsync(Guid sprintId)
        {
            var sprint = await _sprintRepo.GetByIdWithIncludesAsync(
                sprintId, 
                s => s.TestPlan, 
                s => s.UserStories, 
                s => s.Tasks, 
                s => s.UnplannedTasks, 
                s => s.Retrospective);

            if (sprint == null) throw new ArgumentException("Sprint no encontrado.");

            var allStories = (await _storyRepo.GetAllAsync())
                .Where(s => s.TestPlanId == sprint.TestPlanId)
                .OrderBy(s => s.PriorityOrder)
                .ToList();

            var sb = new StringBuilder();
            
            // CSV con BOM UTF-8 que abre automáticamente como tabla en Microsoft Excel
            sb.AppendLine("PLANIFICACIÓN DE TRABAJOS DE DESARROLLO - MATRIZ SCRUM");
            sb.AppendLine($"Proyecto:;{sprint.TestPlan.ProjectName};Sprint:;{sprint.SprintNumber} ({sprint.Name})");
            sb.AppendLine($"Product Owner:;{sprint.ProductOwner};Scrum Master:;{sprint.ScrumMaster}");
            sb.AppendLine($"Semanas:;{sprint.Weeks};Capacidad Total (Horas):;{sprint.TotalCapacityHours}");
            sb.AppendLine($"Horas por día/miembro:;{sprint.DailyHoursPerMember};Horas por semana/miembro:;{sprint.WeeklyHoursPerMember}");
            sb.AppendLine();

            sb.AppendLine("=== PRODUCT BACKLOG - HISTORIAS DE USUARIO ===");
            sb.AppendLine("#;Orden;HU;Nombre del Requisito;Módulo;Business Value;Story Point;Cociente de Decisión (BV/SP);Estado;Prioridad");
            int num = 1;
            foreach (var st in allStories)
            {
                sb.AppendLine($"{num++};{st.PriorityOrder};{st.Code};\"{st.Title}\";{st.Module};{st.BusinessValue};{st.StoryPoints};{st.DecisionQuotient:F2};{st.Status};{st.Priority}");
            }
            sb.AppendLine();

            sb.AppendLine($"=== TAREAS DEL SPRINT {sprint.SprintNumber} ===");
            sb.AppendLine("Historia de usuario;Desarrollador;Fase Desarrollo;Tipo;TAREA;t(Horas Estimadas);t(Horas Reales);ESTADO;COMENTARIO");
            foreach (var t in sprint.Tasks)
            {
                var storyCode = sprint.UserStories.FirstOrDefault(u => u.Id == t.UserStoryId)?.Code ?? "-";
                sb.AppendLine($"{storyCode};{t.Developer};{t.Phase};{t.Type};\"{t.Title}\";{t.EstimatedHours};{t.RealHours};{t.Status};\"{t.Comment}\"");
            }
            sb.AppendLine();

            sb.AppendLine("=== TAREAS NO PLANIFICADAS (TNP) ===");
            sb.AppendLine("Fecha;Desarrollador;TAREA;DURACIÓN (Horas)");
            foreach (var ut in sprint.UnplannedTasks)
            {
                sb.AppendLine($"{ut.Date:yyyy-MM-dd};{ut.Developer};\"{ut.TaskDescription}\";{ut.DurationHours}");
            }
            sb.AppendLine();

            if (sprint.Retrospective != null)
            {
                sb.AppendLine("=== RETROSPECTIVA DEL SPRINT ===");
                sb.AppendLine($"Qué salió bien:;\"{sprint.Retrospective.WhatWentWell}\"");
                sb.AppendLine($"Qué salió mal:;\"{sprint.Retrospective.WhatWentWrong}\"");
                sb.AppendLine($"Qué se terminó:;\"{sprint.Retrospective.CompletedSummary}\"");
                sb.AppendLine($"Qué quedó pendiente:;\"{sprint.Retrospective.PendingSummary}\"");
                sb.AppendLine($"Acuerdos y mejoras:;\"{sprint.Retrospective.Agreements}\"");
            }

            var preamble = Encoding.UTF8.GetPreamble();
            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            var result = new byte[preamble.Length + bytes.Length];
            Buffer.BlockCopy(preamble, 0, result, 0, preamble.Length);
            Buffer.BlockCopy(bytes, 0, result, preamble.Length, bytes.Length);

            return result;
        }

        #endregion
    }
}
