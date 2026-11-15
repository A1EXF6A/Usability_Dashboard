using Domain.Common;
using System;

namespace Domain.Entities
{
    public class DailyLog : BaseEntity
    {
        public Guid SprintId { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string TeamMember { get; set; } = string.Empty;
        public string Progress { get; set; } = string.Empty; // Avance ("¿Qué hice hoy?")
        public string NextStep { get; set; } = string.Empty; // Siguiente paso ("¿Qué haré mañana?")
        public string Impediments { get; set; } = string.Empty; // Impedimentos ("¿Hay bloqueos?")

        public Sprint Sprint { get; set; } = null!;
    }
}
