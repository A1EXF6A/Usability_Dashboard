using System;

namespace Application.DTOs
{
    public class UserStoryDto
    {
        public Guid Id { get; set; }
        public Guid TestPlanId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public decimal BusinessValue { get; set; }
        public decimal StoryPoints { get; set; }
        public decimal DecisionQuotient { get; set; }
        public int PriorityOrder { get; set; }
        public string Priority { get; set; } = "Media";
        public string Status { get; set; } = "Backlog";
        public string AcceptanceCriteria { get; set; } = string.Empty;

        // Vínculo con Finding
        public Guid? FindingId { get; set; }
        public string? FindingDescription { get; set; }

        // Vínculo con Sprint
        public Guid? SprintId { get; set; }
        public string? SprintName { get; set; }
        
        public int TaskCount { get; set; }
    }

    public class CreateUserStoryDto
    {
        public Guid TestPlanId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Module { get; set; } = "General";
        public decimal BusinessValue { get; set; } = 1;
        public decimal StoryPoints { get; set; } = 1;
        public int PriorityOrder { get; set; }
        public string Priority { get; set; } = "Media";
        public string Status { get; set; } = "Backlog";
        public string AcceptanceCriteria { get; set; } = string.Empty;
        public Guid? FindingId { get; set; }
        public Guid? SprintId { get; set; }
    }

    public class UpdateUserStoryDto
    {
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Module { get; set; } = "General";
        public decimal BusinessValue { get; set; }
        public decimal StoryPoints { get; set; }
        public int PriorityOrder { get; set; }
        public string Priority { get; set; } = "Media";
        public string Status { get; set; } = "Backlog";
        public string AcceptanceCriteria { get; set; } = string.Empty;
        public Guid? FindingId { get; set; }
        public Guid? SprintId { get; set; }
    }

    public class ReorderUserStoriesDto
    {
        public List<Guid> StoryIds { get; set; } = new();
    }
}
