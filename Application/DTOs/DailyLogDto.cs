using System;

namespace Application.DTOs
{
    public class DailyLogDto
    {
        public Guid Id { get; set; }
        public Guid SprintId { get; set; }
        public DateTime Date { get; set; }
        public string TeamMember { get; set; } = string.Empty;
        public string Progress { get; set; } = string.Empty;
        public string NextStep { get; set; } = string.Empty;
        public string Impediments { get; set; } = string.Empty;
    }

    public class CreateDailyLogDto
    {
        public Guid SprintId { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string TeamMember { get; set; } = string.Empty;
        public string Progress { get; set; } = string.Empty;
        public string NextStep { get; set; } = string.Empty;
        public string Impediments { get; set; } = string.Empty;
    }
}
