using Domain.Common;
using System;

namespace Domain.Entities
{
    public class UnplannedTask : BaseEntity
    {
        public Guid SprintId { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string Developer { get; set; } = string.Empty;
        public string TaskDescription { get; set; } = string.Empty;
        public decimal DurationHours { get; set; } = 0;

        public Sprint Sprint { get; set; } = null!;
    }
}
