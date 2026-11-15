using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class TeamMemberInfo
    {
        public string Name { get; set; } = string.Empty;
        public decimal HoursPerSprint { get; set; } = 16;
    }

    public class SprintDto
    {
        public Guid Id { get; set; }
        public Guid TestPlanId { get; set; }
        public int SprintNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Goal { get; set; } = string.Empty;
        public string Weeks { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ProductOwner { get; set; } = string.Empty;
        public string ScrumMaster { get; set; } = string.Empty;
        public decimal DailyHoursPerMember { get; set; }
        public decimal WeeklyHoursPerMember { get; set; }
        public int SprintWeeksCount { get; set; }
        public decimal TotalCapacityHours { get; set; }
        public string TeamMembersJson { get; set; } = "[]";
        public string Status { get; set; } = "Planned";

        // Métricas calculadas
        public decimal TotalEstimatedHours { get; set; }
        public decimal TotalRealHours { get; set; }
        public bool IsOverCapacity => TotalEstimatedHours > TotalCapacityHours;
        public decimal CapacityUsagePercentage => TotalCapacityHours > 0 
            ? Math.Round((TotalEstimatedHours / TotalCapacityHours) * 100, 1) 
            : 0;

        public int StoryCount { get; set; }
        public int TaskCount { get; set; }
        public int UnplannedTaskCount { get; set; }
        public decimal TotalUnplannedHours { get; set; }
    }

    public class SprintDetailDto : SprintDto
    {
        public List<UserStoryDto> UserStories { get; set; } = new();
        public List<SprintTaskDto> Tasks { get; set; } = new();
        public List<UnplannedTaskDto> UnplannedTasks { get; set; } = new();
        public List<DailyLogDto> DailyLogs { get; set; } = new();
        public SprintRetrospectiveDto? Retrospective { get; set; }
    }

    public class CreateSprintDto
    {
        public Guid TestPlanId { get; set; }
        public int SprintNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Goal { get; set; } = string.Empty;
        public string Weeks { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ProductOwner { get; set; } = "Product Owner";
        public string ScrumMaster { get; set; } = "Scrum Master";
        public decimal DailyHoursPerMember { get; set; } = 2;
        public decimal WeeklyHoursPerMember { get; set; } = 8;
        public int SprintWeeksCount { get; set; } = 2;
        public decimal TotalCapacityHours { get; set; } = 64;
        public string TeamMembersJson { get; set; } = "[]";
        public string Status { get; set; } = "Planned";
    }

    public class UpdateSprintDto
    {
        public int SprintNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Goal { get; set; } = string.Empty;
        public string Weeks { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ProductOwner { get; set; } = string.Empty;
        public string ScrumMaster { get; set; } = string.Empty;
        public decimal DailyHoursPerMember { get; set; }
        public decimal WeeklyHoursPerMember { get; set; }
        public int SprintWeeksCount { get; set; }
        public decimal TotalCapacityHours { get; set; }
        public string TeamMembersJson { get; set; } = "[]";
        public string Status { get; set; } = "Planned";
    }

    public class AssignStoriesDto
    {
        public List<Guid> StoryIds { get; set; } = new();
    }
}
