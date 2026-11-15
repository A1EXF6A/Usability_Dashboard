using Domain.Common;
using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class Sprint : BaseEntity
    {
        public Guid TestPlanId { get; set; }
        public int SprintNumber { get; set; } // 1, 2, 3, 4
        public string Name { get; set; } = string.Empty; // "Sprint 1"
        public string Goal { get; set; } = string.Empty; // Objetivo del sprint
        public string Weeks { get; set; } = string.Empty; // "Sem. 10–11"
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ProductOwner { get; set; } = "Product Owner";
        public string ScrumMaster { get; set; } = "Scrum Master";
        
        // Capacidad y equipo
        public decimal DailyHoursPerMember { get; set; } = 2; // Horas por día por miembro
        public decimal WeeklyHoursPerMember { get; set; } = 8; // Horas por semana por miembro
        public int SprintWeeksCount { get; set; } = 2; // Semanas por sprint (ej. 2)
        public decimal TotalCapacityHours { get; set; } = 64; // Capacidad total calculada
        public string TeamMembersJson { get; set; } = "[]"; // Lista de integrantes y horas
        public string Status { get; set; } = "Planned"; // Planned, Active, Completed

        public TestPlan TestPlan { get; set; } = null!;
        public ICollection<UserStory> UserStories { get; set; } = new List<UserStory>();
        public ICollection<SprintTask> Tasks { get; set; } = new List<SprintTask>();
        public ICollection<UnplannedTask> UnplannedTasks { get; set; } = new List<UnplannedTask>();
        public ICollection<DailyLog> DailyLogs { get; set; } = new List<DailyLog>();
        public SprintRetrospective? Retrospective { get; set; }
    }
}
