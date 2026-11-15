using System;

namespace Application.DTOs
{
    public class SprintRetrospectiveDto
    {
        public Guid Id { get; set; }
        public Guid SprintId { get; set; }
        public string WhatWentWell { get; set; } = string.Empty;
        public string WhatWentWrong { get; set; } = string.Empty;
        public string CompletedSummary { get; set; } = string.Empty;
        public string PendingSummary { get; set; } = string.Empty;
        public string Agreements { get; set; } = string.Empty;
    }

    public class SaveSprintRetrospectiveDto
    {
        public string WhatWentWell { get; set; } = string.Empty;
        public string WhatWentWrong { get; set; } = string.Empty;
        public string CompletedSummary { get; set; } = string.Empty;
        public string PendingSummary { get; set; } = string.Empty;
        public string Agreements { get; set; } = string.Empty;
    }
}
