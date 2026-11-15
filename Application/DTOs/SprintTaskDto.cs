using System;

namespace Application.DTOs
{
    public record SprintTaskDto(
        Guid Id,
        Guid SprintId,
        Guid? UserStoryId,
        string? UserStoryTitle,
        string TaskCode,
        string Title,
        string Description,
        int EstimatedHours,
        string Status,
        string Assignee,
        int Order,
        DateTime CreatedAt
    );

    public record CreateSprintTaskDto(
        Guid SprintId,
        Guid? UserStoryId,
        string TaskCode,
        string Title,
        string Description,
        int EstimatedHours,
        string Status,
        string Assignee,
        int Order = 0
    );

    public record UpdateSprintTaskDto(
        string Title,
        string Description,
        int EstimatedHours,
        string Status,
        string Assignee,
        int Order = 0,
        Guid? UserStoryId = null
    );

    public record UpdateTaskStatusDto(
        string Status
    );

    public record UpdateTaskAssigneeDto(
        string Assignee
    );

    public record TeamMemberProgressDto(
        string Assignee,
        int TotalTasks,
        int CompletedTasks,
        int InProgressTasks,
        int PendingTasks,
        int TotalEstimatedHours,
        int CompletedHours
    );
}
