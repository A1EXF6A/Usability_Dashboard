using System;

namespace Application.DTOs
{
    public class UnplannedTaskDto
    {
        public Guid Id { get; set; }
        public Guid SprintId { get; set; }
        public DateTime Date { get; set; }
        public string Developer { get; set; } = string.Empty;
        public string TaskDescription { get; set; } = string.Empty;
        public decimal DurationHours { get; set; }
    }

    public class CreateUnplannedTaskDto
    {
        public Guid SprintId { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string Developer { get; set; } = string.Empty;
        public string TaskDescription { get; set; } = string.Empty;
        public decimal DurationHours { get; set; } = 1;
    }
}
