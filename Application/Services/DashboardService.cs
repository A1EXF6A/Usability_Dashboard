using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IRepository<TestSession> _sessionRepository;
        private readonly IRepository<Finding> _findingRepository;
        private readonly IRepository<ImprovementAction> _actionRepository;
        private readonly IRepository<TestPlan> _planRepository;
        private readonly IRepository<TestTask> _taskRepository;

        public DashboardService(
            IRepository<TestSession> sessionRepository,
            IRepository<Finding> findingRepository,
            IRepository<ImprovementAction> actionRepository,
            IRepository<TestPlan> planRepository,
            IRepository<TestTask> taskRepository)
        {
            _sessionRepository = sessionRepository;
            _findingRepository = findingRepository;
            _actionRepository = actionRepository;
            _planRepository = planRepository;
            _taskRepository = taskRepository;
        }

        public async Task<DashboardStatsDto> GetStatsAsync(Guid? testPlanId)
        {
            // Traer sesiones con sus observaciones y participantes
            var sessions = (await _sessionRepository.GetAllWithIncludesAsync(
                x => x.ObservationLogs,
                x => x.Participant
            )).ToList();

            var findings = (await _findingRepository.GetAllAsync()).ToList();
            var actions = (await _actionRepository.GetAllAsync()).ToList();

            // Filtrar por plan si se especifica
            if (testPlanId.HasValue)
            {
                sessions = sessions.Where(s => s.TestPlanId == testPlanId.Value).ToList();
                findings = findings.Where(f => f.TestPlanId == testPlanId.Value).ToList();

                // Actions belong to findings, not directly to plans — filter via finding IDs
                var planFindingIds = findings.Select(f => f.Id).ToHashSet();
                actions = actions.Where(a => planFindingIds.Contains(a.FindingId)).ToList();
            }

            // Aplanar todas las observaciones de todas las sesiones
            var logs = sessions.SelectMany(s => s.ObservationLogs).ToList();

            var totalLogs = logs.Count;
            var successLogs = logs.Count(l => l.TaskSuccess);
            var avgTime = totalLogs > 0 ? logs.Average(l => (double)l.TimeSeconds) : 0;
            var totalErrors = logs.Sum(l => l.ErrorCount);

            // Agrupar por severidad
            var errorsBySeverity = logs
                .GroupBy(l => l.Severity.ToString())
                .Select(g => new ErrorsBySeverityDto(g.Key, g.Sum(l => l.ErrorCount)));

            // Agrupar por tarea
            var successByTask = logs
                .GroupBy(l => l.TestTaskId)
                .Select(g => new SuccessByTaskDto(
                    g.Key,
                    g.Count(),
                    g.Count(l => l.TaskSuccess),
                    g.Average(l => (double)l.TimeSeconds)));

            // Nueva métrica — comparar plataformas
            var statsByPlatform = sessions
                .GroupBy(s => s.PlatformTested)
                .Select(g => new PlatformStatsDto(
                    g.Key,
                    g.SelectMany(s => s.ObservationLogs).Count(),
                    g.SelectMany(s => s.ObservationLogs).Count(l => l.TaskSuccess),
                    g.SelectMany(s => s.ObservationLogs).Any()
                        ? g.SelectMany(s => s.ObservationLogs).Average(l => (double)l.TimeSeconds)
                        : 0
                ));

            return new DashboardStatsDto(
                TotalObservations: totalLogs,
                SuccessRate: totalLogs > 0 ? Math.Round((double)successLogs / totalLogs * 100, 1) : 0,
                AverageTimeSeconds: Math.Round(avgTime, 1),
                TotalErrors: totalErrors,
                TotalFindings: findings.Count,
                CriticalFindings: findings.Count(f => f.Severity == SeverityLevel.Critical),
                ModerateFindings: findings.Count(f => f.Severity == SeverityLevel.Medium),
                TotalActions: actions.Count,
                CompletedActions: actions.Count(a => a.Status == ActionStatus.Resolved),
                PendingActions: actions.Count(a => a.Status == ActionStatus.Open),
                InProgressActions: actions.Count(a => a.Status == ActionStatus.InProgress),
                ErrorsBySeverity: errorsBySeverity,
                SuccessByTask: successByTask,
                StatsByPlatform: statsByPlatform  
            );
        }

        public async Task<EvaluationComparisonDto> GetEvaluationComparisonAsync(Guid testPlanId)
        {
            var plan = await _planRepository.GetByIdAsync(testPlanId);
            var projectName = plan?.ProjectName ?? "Plan de Usabilidad";
            var evaluatedModule = plan?.EvaluatedModule ?? "Módulo General";

            var sessions = (await _sessionRepository.GetAllWithIncludesAsync(
                x => x.ObservationLogs,
                x => x.Participant
            ))
            .Where(s => s.TestPlanId == testPlanId)
            .OrderBy(s => s.Date)
            .ToList();

            var tasks = (await _taskRepository.GetAllAsync())
                .Where(t => t.TestPlanId == testPlanId)
                .OrderBy(t => t.TaskNumber)
                .ToList();

            // Separar sesiones Iniciales y Finales
            var initialSessions = sessions.Where(s => s.EvaluationPhase == "Inicial" || string.IsNullOrWhiteSpace(s.EvaluationPhase)).ToList();
            var finalSessions = sessions.Where(s => s.EvaluationPhase == "Final").ToList();

            // Si no se clasificó explícitamente ninguna como Final pero hay al menos 2 sesiones,
            // y el usuario aún no configuró las fases, tomar la segunda mitad como final para visualización
            bool hasBothPhases = finalSessions.Any();
            if (!hasBothPhases && sessions.Count >= 2)
            {
                // No forzar si no está marcado, pero permitir ver la fase inicial
            }

            var initialMetrics = CalculatePhaseMetrics("Evaluación Inicial", initialSessions, tasks);
            var finalMetrics = CalculatePhaseMetrics("Evaluación Final", finalSessions, tasks);

            // Calcular deltas
            var deltaTime = hasBothPhases ? Math.Round(finalMetrics.AverageTimeSeconds - initialMetrics.AverageTimeSeconds, 1) : 0;
            var timeReduction = (hasBothPhases && initialMetrics.AverageTimeSeconds > 0)
                ? Math.Round(((initialMetrics.AverageTimeSeconds - finalMetrics.AverageTimeSeconds) / initialMetrics.AverageTimeSeconds) * 100, 1)
                : 0;

            var deltaErrors = hasBothPhases ? finalMetrics.TotalErrors - initialMetrics.TotalErrors : 0;
            var errorReduction = (hasBothPhases && initialMetrics.TotalErrors > 0)
                ? Math.Round(((double)(initialMetrics.TotalErrors - finalMetrics.TotalErrors) / initialMetrics.TotalErrors) * 100, 1)
                : 0;

            var deltaSuccess = hasBothPhases ? Math.Round(finalMetrics.SuccessRate - initialMetrics.SuccessRate, 1) : 0;
            var deltaSatisfaction = hasBothPhases ? Math.Round(finalMetrics.AverageSatisfaction - initialMetrics.AverageSatisfaction, 1) : 0;
            var deltaCompleted = hasBothPhases ? finalMetrics.CompletedTasksCount - initialMetrics.CompletedTasksCount : 0;

            var delta = new ComparisonDeltaDto(
                DeltaTimeSeconds: deltaTime,
                TimeReductionPercentage: timeReduction,
                DeltaErrors: deltaErrors,
                ErrorReductionPercentage: errorReduction,
                DeltaSuccessRate: deltaSuccess,
                DeltaSatisfaction: deltaSatisfaction,
                CompletedTasksDifference: deltaCompleted
            );

            return new EvaluationComparisonDto(
                TestPlanId: testPlanId,
                ProjectName: projectName,
                EvaluatedModule: evaluatedModule,
                InitialEvaluation: initialMetrics,
                FinalEvaluation: finalMetrics,
                Delta: delta,
                HasBothPhases: hasBothPhases
            );
        }

        private static PhaseMetricsDto CalculatePhaseMetrics(string phaseName, List<TestSession> sessions, List<TestTask> tasks)
        {
            var logs = sessions.SelectMany(s => s.ObservationLogs).ToList();
            var totalLogs = logs.Count;
            var successLogs = logs.Count(l => l.TaskSuccess);
            var successRate = totalLogs > 0 ? Math.Round((double)successLogs / totalLogs * 100, 1) : 0;
            var avgTime = totalLogs > 0 ? Math.Round(logs.Average(l => (double)l.TimeSeconds), 1) : 0;
            var totalErrors = logs.Sum(l => l.ErrorCount);
            var completedCount = successLogs;

            // Satisfacción promedio (evaluada si se registró SatisfactionScore)
            var scoredSessions = sessions.Where(s => s.SatisfactionScore.HasValue).ToList();
            var avgSatisfaction = scoredSessions.Any()
                ? Math.Round(scoredSessions.Average(s => (double)s.SatisfactionScore!.Value), 1)
                : (totalLogs > 0 ? Math.Round(successRate * 0.85, 1) : 0); // Estimación basada en tasa si no hay registro directo

            var taskMetrics = new List<TaskComparisonMetricDto>();
            foreach (var task in tasks)
            {
                var taskLogs = logs.Where(l => l.TestTaskId == task.Id).ToList();
                var taskSuccesses = taskLogs.Count(l => l.TaskSuccess);
                var taskRate = taskLogs.Any() ? Math.Round((double)taskSuccesses / taskLogs.Count * 100, 1) : 0;
                var taskAvgTime = taskLogs.Any() ? Math.Round(taskLogs.Average(l => (double)l.TimeSeconds), 1) : 0;
                var taskErrors = taskLogs.Sum(l => l.ErrorCount);

                taskMetrics.Add(new TaskComparisonMetricDto(
                    TaskId: task.Id,
                    TaskNumber: task.TaskNumber,
                    Scenario: task.Scenario,
                    InitialAttempts: phaseName == "Evaluación Inicial" ? taskLogs.Count : 0,
                    InitialSuccesses: phaseName == "Evaluación Inicial" ? taskSuccesses : 0,
                    InitialSuccessRate: phaseName == "Evaluación Inicial" ? taskRate : 0,
                    InitialAvgTimeSeconds: phaseName == "Evaluación Inicial" ? taskAvgTime : 0,
                    InitialErrorCount: phaseName == "Evaluación Inicial" ? taskErrors : 0,
                    FinalAttempts: phaseName == "Evaluación Final" ? taskLogs.Count : 0,
                    FinalSuccesses: phaseName == "Evaluación Final" ? taskSuccesses : 0,
                    FinalSuccessRate: phaseName == "Evaluación Final" ? taskRate : 0,
                    FinalAvgTimeSeconds: phaseName == "Evaluación Final" ? taskAvgTime : 0,
                    FinalErrorCount: phaseName == "Evaluación Final" ? taskErrors : 0,
                    DeltaTimeSeconds: 0,
                    DeltaSuccessRate: 0,
                    DeltaErrors: 0
                ));
            }

            return new PhaseMetricsDto(
                PhaseName: phaseName,
                SessionCount: sessions.Count,
                TotalObservations: totalLogs,
                SuccessRate: successRate,
                AverageTimeSeconds: avgTime,
                TotalErrors: totalErrors,
                CompletedTasksCount: completedCount,
                AverageSatisfaction: avgSatisfaction,
                TaskMetrics: taskMetrics
            );
        }

    }
}
