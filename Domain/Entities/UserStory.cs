using Domain.Common;
using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class UserStory : BaseEntity
    {
        public Guid TestPlanId { get; set; }
        public Guid? SprintId { get; set; }

        public string StoryCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "Media"; // Alta, Media, Baja
        public int EffortEstimation { get; set; } = 3; // Puntos de historia o esfuerzo
        public string Origin { get; set; } = string.Empty; // Trazabilidad con hallazgo u observación
        public Guid? FindingId { get; set; }
        public string Status { get; set; } = "Backlog"; // Backlog, InSprint, Done
        public string AcceptanceCriteria { get; set; } = "[]"; // JSON array de criterios de aceptación

        // Propiedades de navegación
        public TestPlan TestPlan { get; set; } = null!;
        public Sprint? Sprint { get; set; }
        public ICollection<SprintTask> Tasks { get; set; } = new List<SprintTask>();
    }
}
