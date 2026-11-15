using Domain.Common;
using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class Sprint : BaseEntity
    {
        public Guid TestPlanId { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Goal { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Planificado"; // Planificado, Activo, Completado

        // Propiedades de navegación
        public TestPlan TestPlan { get; set; } = null!;
        public ICollection<UserStory> UserStories { get; set; } = new List<UserStory>();
        public ICollection<SprintTask> Tasks { get; set; } = new List<SprintTask>();
        public SprintRetrospective? Retrospective { get; set; }
    }
}
