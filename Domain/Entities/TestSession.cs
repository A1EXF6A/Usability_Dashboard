using Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class TestSession : BaseEntity
    {
        public Guid TestPlanId { get; set; }
        public Guid ParticipantId { get; set; }

        public DateTime Date { get; set; }
        public string PlatformTested { get; set; } 
        public string EvaluationPhase { get; set; } = "Inicial"; // "Inicial" | "Final"
        public int? SatisfactionScore { get; set; } // Puntuación de satisfacción (SUS 1-100 o CSAT 1-5)

        public TestPlan TestPlan { get; set; }
        public Participant Participant { get; set; }
        public ICollection<ObservationLog> ObservationLogs { get; set; }
    }
}
