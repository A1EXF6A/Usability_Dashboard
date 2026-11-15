using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public record UserStoryDto(
        Guid Id,
        Guid TestPlanId,
        Guid? SprintId,
        string? SprintName,
        string StoryCode,
        string Title,
        string Description,
        string Priority,
        int EffortEstimation,
        string Origin,
        Guid? FindingId,
        string Status,
        List<string> AcceptanceCriteria,
        DateTime CreatedAt,
        List<SprintTaskDto> Tasks
    );

    public record CreateUserStoryDto(
        Guid TestPlanId,
        string StoryCode,
        string Title,
        string Description,
        string Priority,
        int EffortEstimation,
        string Origin,
        Guid? FindingId,
        List<string> AcceptanceCriteria,
        Guid? SprintId = null
    );

    public record UpdateUserStoryDto(
        string Title,
        string Description,
        string Priority,
        int EffortEstimation,
        string Origin,
        Guid? FindingId,
        string Status,
        List<string> AcceptanceCriteria,
        Guid? SprintId = null
    );

    public record ImportApprovedStoriesDto(
        List<CreateUserStoryDto> Stories
    );
}
