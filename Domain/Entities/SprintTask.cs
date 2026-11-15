using Domain.Common;
using System;

namespace Domain.Entities
{
    public class SprintTask : BaseEntity
    {
        public Guid SprintId { get; set; }
        public Guid? UserStoryId { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Developer { get; set; } = string.Empty; // Responsable / Desarrollador
        public string Phase { get; set; } = "Análisis"; // Análisis, Diseño, Implementación, Pruebas
        public string Type { get; set; } = "Nuevo"; // Nuevo, Error
        public decimal EstimatedHours { get; set; } = 0; // t(Horas) estimadas
        public decimal RealHours { get; set; } = 0; // t(Horas) reales
        public string Status { get; set; } = "Pendiente"; // Pendiente, En progreso, En revisión, Terminado
        public string Comment { get; set; } = string.Empty;

        public Sprint Sprint { get; set; } = null!;
        public UserStory? UserStory { get; set; }
    }
}
