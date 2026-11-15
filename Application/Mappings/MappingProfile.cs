using Application.DTOs;
using AutoMapper;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // TestPlan
            CreateMap<TestPlan, TestPlanDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));
            CreateMap<CreateTestPlanDto, TestPlan>();  
            CreateMap<UpdateTestPlanDto, TestPlan>()
                .ForMember(dest => dest.Status, opt => opt.Ignore());

            // TestTask
            CreateMap<TestTask, TestTaskDto>();
            CreateMap<CreateTestTaskDto, TestTask>();
            CreateMap<UpdateTestTaskDto, TestTask>();

            // Participant
            CreateMap<Participant, ParticipantDto>();
            CreateMap<CreateParticipantDto, Participant>();
            CreateMap<UpdateParticipantDto, Participant>();

            // Finding
            CreateMap<Finding, FindingDto>()
                .ForMember(dest => dest.Severity, opt => opt.MapFrom(src => src.Severity.ToString()))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
            CreateMap<CreateFindingDto, Finding>();
            CreateMap<UpdateFindingDto, Finding>();

            // ObservationLog
            CreateMap<ObservationLog, ObservationLogDto>()
                .ForMember(dest => dest.Severity, opt => opt.MapFrom(src => src.Severity.ToString()));
            CreateMap<CreateObservationLogDto, ObservationLog>();
            CreateMap<UpdateObservationLogDto, ObservationLog>();

            // ImprovementAction
            CreateMap<ImprovementAction, ImprovementActionDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority.ToString()));
            CreateMap<CreateImprovementActionDto, ImprovementAction>();
            CreateMap<UpdateImprovementActionDto, ImprovementAction>();

            // ModeratorScript
            CreateMap<ModeratorScript, ModeratorScriptDto>();
            CreateMap<CreateModeratorScriptDto, ModeratorScript>();
            CreateMap<UpdateModeratorScriptDto, ModeratorScript>();

            // TestSession
            CreateMap<TestSession, TestSessionDto>()
                .ForMember(dest => dest.ParticipantName,
                    opt => opt.MapFrom(src => src.Participant != null ? src.Participant.Name : string.Empty))
                .ForMember(dest => dest.EvaluationPhase,
                    opt => opt.MapFrom(src => src.EvaluationPhase ?? "Inicial"))
                .ForMember(dest => dest.SatisfactionScore,
                    opt => opt.MapFrom(src => src.SatisfactionScore));
            CreateMap<CreateTestSessionDto, TestSession>();
            CreateMap<UpdateTestSessionDto, TestSession>();

            // UserStory
            CreateMap<UserStory, UserStoryDto>()
                .ForMember(dest => dest.SprintName, opt => opt.MapFrom(src => src.Sprint != null ? src.Sprint.Name : null))
                .ForMember(dest => dest.AcceptanceCriteria, opt => opt.MapFrom(src =>
                    string.IsNullOrWhiteSpace(src.AcceptanceCriteria)
                        ? new List<string>()
                        : System.Text.Json.JsonSerializer.Deserialize<List<string>>(src.AcceptanceCriteria, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()))
                .ForMember(dest => dest.Tasks, opt => opt.MapFrom(src => src.Tasks));
            CreateMap<CreateUserStoryDto, UserStory>()
                .ForMember(dest => dest.AcceptanceCriteria, opt => opt.MapFrom(src =>
                    System.Text.Json.JsonSerializer.Serialize(src.AcceptanceCriteria ?? new List<string>(), (System.Text.Json.JsonSerializerOptions?)null)));
            CreateMap<UpdateUserStoryDto, UserStory>()
                .ForMember(dest => dest.AcceptanceCriteria, opt => opt.MapFrom(src =>
                    System.Text.Json.JsonSerializer.Serialize(src.AcceptanceCriteria ?? new List<string>(), (System.Text.Json.JsonSerializerOptions?)null)));

            // SprintTask
            CreateMap<SprintTask, SprintTaskDto>()
                .ForMember(dest => dest.UserStoryTitle, opt => opt.MapFrom(src => src.UserStory != null ? src.UserStory.Title : null));
            CreateMap<CreateSprintTaskDto, SprintTask>();
            CreateMap<UpdateSprintTaskDto, SprintTask>();

            // Sprint
            CreateMap<Sprint, SprintDto>()
                .ForMember(dest => dest.UserStories, opt => opt.MapFrom(src => src.UserStories))
                .ForMember(dest => dest.Tasks, opt => opt.MapFrom(src => src.Tasks))
                .ForMember(dest => dest.TotalEstimatedHours, opt => opt.MapFrom(src => src.Tasks.Sum(t => t.EstimatedHours)))
                .ForMember(dest => dest.CompletedHours, opt => opt.MapFrom(src => src.Tasks.Where(t => t.Status == "Terminado").Sum(t => t.EstimatedHours)))
                .ForMember(dest => dest.TotalTasksCount, opt => opt.MapFrom(src => src.Tasks.Count))
                .ForMember(dest => dest.CompletedTasksCount, opt => opt.MapFrom(src => src.Tasks.Count(t => t.Status == "Terminado")))
                .ForMember(dest => dest.ProgressPercentage, opt => opt.MapFrom(src =>
                    src.Tasks.Count > 0 ? Math.Round((double)src.Tasks.Count(t => t.Status == "Terminado") / src.Tasks.Count * 100, 1) : 0));
            CreateMap<CreateSprintDto, Sprint>();
            CreateMap<UpdateSprintDto, Sprint>();

            // SprintRetrospective
            CreateMap<SprintRetrospective, SprintRetrospectiveDto>()
                .ForMember(dest => dest.ActionItems, opt => opt.MapFrom(src =>
                    string.IsNullOrWhiteSpace(src.ActionItemsJson)
                        ? new List<RetrospectiveActionItemDto>()
                        : System.Text.Json.JsonSerializer.Deserialize<List<RetrospectiveActionItemDto>>(src.ActionItemsJson, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<RetrospectiveActionItemDto>()));
            CreateMap<SaveRetrospectiveDto, SprintRetrospective>()
                .ForMember(dest => dest.ActionItemsJson, opt => opt.MapFrom(src =>
                    System.Text.Json.JsonSerializer.Serialize(src.ActionItems ?? new List<RetrospectiveActionItemDto>(), (System.Text.Json.JsonSerializerOptions?)null)));


        }
    }
}
