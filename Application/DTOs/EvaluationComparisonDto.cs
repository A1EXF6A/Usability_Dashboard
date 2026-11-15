using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public record TaskComparisonMetricDto(
        Guid TaskId,
        int TaskNumber,
        string Scenario,
        int InitialAttempts,
        int InitialSuccesses,
        double InitialSuccessRate,
        double InitialAvgTimeSeconds,
        int InitialErrorCount,
        int FinalAttempts,
        int FinalSuccesses,
        double FinalSuccessRate,
        double FinalAvgTimeSeconds,
        int FinalErrorCount,
        double DeltaTimeSeconds,
        double DeltaSuccessRate,
        int DeltaErrors
    );

    public record PhaseMetricsDto(
        string PhaseName,
        int SessionCount,
        int TotalObservations,
        double SuccessRate,
        double AverageTimeSeconds,
        int TotalErrors,
        int CompletedTasksCount,
        double AverageSatisfaction, // Promedio de satisfacción SUS (0-100) o escala 1-5
        List<TaskComparisonMetricDto> TaskMetrics
    );

    public record ComparisonDeltaDto(
        double DeltaTimeSeconds,
        double TimeReductionPercentage,
        int DeltaErrors,
        double ErrorReductionPercentage,
        double DeltaSuccessRate,
        double DeltaSatisfaction,
        int CompletedTasksDifference
    );

    public record EvaluationComparisonDto(
        Guid TestPlanId,
        string ProjectName,
        string EvaluatedModule,
        PhaseMetricsDto InitialEvaluation,
        PhaseMetricsDto FinalEvaluation,
        ComparisonDeltaDto Delta,
        bool HasBothPhases
    );
}
