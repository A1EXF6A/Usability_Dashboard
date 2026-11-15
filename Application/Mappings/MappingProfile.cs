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
                    opt => opt.MapFrom(src => src.Participant != null ? src.Participant.Name : string.Empty));
            CreateMap<CreateTestSessionDto, TestSession>();
            CreateMap<UpdateTestSessionDto, TestSession>();

            // SCRUM - UserStory
            CreateMap<UserStory, UserStoryDto>()
                .ForMember(dest => dest.FindingDescription, opt => opt.MapFrom(src => src.Finding != null ? src.Finding.Description : null))
                .ForMember(dest => dest.SprintName, opt => opt.MapFrom(src => src.Sprint != null ? src.Sprint.Name : null))
                .ForMember(dest => dest.TaskCount, opt => opt.MapFrom(src => src.Tasks.Count));
            CreateMap<CreateUserStoryDto, UserStory>();
            CreateMap<UpdateUserStoryDto, UserStory>();

            // SCRUM - Sprint
            CreateMap<Sprint, SprintDto>()
                .ForMember(dest => dest.StoryCount, opt => opt.MapFrom(src => src.UserStories.Count))
                .ForMember(dest => dest.TaskCount, opt => opt.MapFrom(src => src.Tasks.Count))
                .ForMember(dest => dest.UnplannedTaskCount, opt => opt.MapFrom(src => src.UnplannedTasks.Count))
                .ForMember(dest => dest.TotalEstimatedHours, opt => opt.MapFrom(src => src.Tasks.Sum(t => t.EstimatedHours)))
                .ForMember(dest => dest.TotalRealHours, opt => opt.MapFrom(src => src.Tasks.Sum(t => t.RealHours)))
                .ForMember(dest => dest.TotalUnplannedHours, opt => opt.MapFrom(src => src.UnplannedTasks.Sum(t => t.DurationHours)));
            CreateMap<Sprint, SprintDetailDto>()
                .IncludeBase<Sprint, SprintDto>()
                .ForMember(dest => dest.UserStories, opt => opt.MapFrom(src => src.UserStories))
                .ForMember(dest => dest.Tasks, opt => opt.MapFrom(src => src.Tasks))
                .ForMember(dest => dest.UnplannedTasks, opt => opt.MapFrom(src => src.UnplannedTasks))
                .ForMember(dest => dest.DailyLogs, opt => opt.MapFrom(src => src.DailyLogs))
                .ForMember(dest => dest.Retrospective, opt => opt.MapFrom(src => src.Retrospective));
            CreateMap<CreateSprintDto, Sprint>();
            CreateMap<UpdateSprintDto, Sprint>();

            // SCRUM - SprintTask
            CreateMap<SprintTask, SprintTaskDto>()
                .ForMember(dest => dest.UserStoryCode, opt => opt.MapFrom(src => src.UserStory != null ? src.UserStory.Code : null))
                .ForMember(dest => dest.UserStoryTitle, opt => opt.MapFrom(src => src.UserStory != null ? src.UserStory.Title : null));
            CreateMap<CreateSprintTaskDto, SprintTask>();
            CreateMap<UpdateSprintTaskDto, SprintTask>();

            // SCRUM - UnplannedTask
            CreateMap<UnplannedTask, UnplannedTaskDto>();
            CreateMap<CreateUnplannedTaskDto, UnplannedTask>();

            // SCRUM - DailyLog
            CreateMap<DailyLog, DailyLogDto>();
            CreateMap<CreateDailyLogDto, DailyLog>();

            // SCRUM - SprintRetrospective
            CreateMap<SprintRetrospective, SprintRetrospectiveDto>();
            CreateMap<SaveSprintRetrospectiveDto, SprintRetrospective>();
        }
    }
}
