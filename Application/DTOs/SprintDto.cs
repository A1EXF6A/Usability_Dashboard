using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public record SprintDto(
        Guid Id,
        Guid TestPlanId,
        string Name,
        string Goal,
        DateTime StartDate,
        DateTime EndDate,
        string Status,
        DateTime CreatedAt,
        int TotalEstimatedHours,
        int CompletedHours,
        int TotalTasksCount,
        int CompletedTasksCount,
        double ProgressPercentage,
        List<UserStoryDto> UserStories,
        List<SprintTaskDto> Tasks
    );

    public record CreateSprintDto(
        Guid TestPlanId,
        string Name,
        string Goal,
        DateTime StartDate,
        DateTime EndDate,
        string Status = "Planificado"
    );

    public record UpdateSprintDto(
        string Name,
        string Goal,
        DateTime StartDate,
        DateTime EndDate,
        string Status
    );

    public record AssignStoryToSprintDto(
        Guid SprintId,
        Guid StoryId
    );
}
