using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record TestSessionDto(
        Guid Id,
        Guid TestPlanId,
        Guid ParticipantId,
        string ParticipantName,
        DateTime Date,
        string PlatformTested,
        string EvaluationPhase,
        int? SatisfactionScore,
        DateTime CreatedAt
    );

    public record CreateTestSessionDto(
        Guid TestPlanId,
        Guid ParticipantId,
        DateTime Date,
        string PlatformTested,
        string EvaluationPhase = "Inicial",
        int? SatisfactionScore = null
    );

    public record UpdateTestSessionDto(
        Guid ParticipantId,
        DateTime Date,
        string PlatformTested,
        string EvaluationPhase = "Inicial",
        int? SatisfactionScore = null
    );
}
