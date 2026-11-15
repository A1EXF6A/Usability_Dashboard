using Domain.Common;
using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class UserStory : BaseEntity
    {
        public Guid TestPlanId { get; set; }
        public string Code { get; set; } = string.Empty; // e.g., "HU-01", "RF.APL.01"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty; // "Como... quiero... para..."
        public string Module { get; set; } = string.Empty; // "Eval.", "Dash.", "SCRUM", "UI", "IA"
        public decimal BusinessValue { get; set; } = 0; // Business Value (BV)
        public decimal StoryPoints { get; set; } = 0; // Story Points (SP)
        public decimal DecisionQuotient { get; set; } = 0; // BV / SP
        public int PriorityOrder { get; set; } = 0; // Orden manual o sugerido
        public string Priority { get; set; } = "Media"; // Alta, Media, Baja
        public string Status { get; set; } = "Backlog"; // Backlog, Asignada, EnProgreso, Terminada
        public string AcceptanceCriteria { get; set; } = string.Empty; // Criterios de aceptación
        
        // Vínculo opcional de trazabilidad con hallazgo de origen
        public Guid? FindingId { get; set; }
        public Finding? Finding { get; set; }
        
        // Asignación a Sprint
        public Guid? SprintId { get; set; }
        public Sprint? Sprint { get; set; }

        public TestPlan TestPlan { get; set; } = null!;
        public ICollection<SprintTask> Tasks { get; set; } = new List<SprintTask>();
    }
}
