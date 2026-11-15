using System;

namespace Application.DTOs
{
    public class SprintTaskDto
    {
        public Guid Id { get; set; }
        public Guid SprintId { get; set; }
        public Guid? UserStoryId { get; set; }
        public string? UserStoryCode { get; set; }
        public string? UserStoryTitle { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Developer { get; set; } = string.Empty;
        public string Phase { get; set; } = "Análisis"; // Análisis, Diseño, Implementación, Pruebas
        public string Type { get; set; } = "Nuevo"; // Nuevo, Error
        public decimal EstimatedHours { get; set; }
        public decimal RealHours { get; set; }
        public string Status { get; set; } = "Pendiente"; // Pendiente, En progreso, En revisión, Terminado
        public string Comment { get; set; } = string.Empty;
    }

    public class CreateSprintTaskDto
    {
        public Guid SprintId { get; set; }
        public Guid? UserStoryId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Developer { get; set; } = string.Empty;
        public string Phase { get; set; } = "Análisis";
        public string Type { get; set; } = "Nuevo";
        public decimal EstimatedHours { get; set; } = 1;
        public decimal RealHours { get; set; } = 0;
        public string Status { get; set; } = "Pendiente";
        public string Comment { get; set; } = string.Empty;
    }

    public class UpdateSprintTaskDto
    {
        public Guid? UserStoryId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Developer { get; set; } = string.Empty;
        public string Phase { get; set; } = "Análisis";
        public string Type { get; set; } = "Nuevo";
        public decimal EstimatedHours { get; set; }
        public decimal RealHours { get; set; }
        public string Status { get; set; } = "Pendiente";
        public string Comment { get; set; } = string.Empty;
    }

    public class UpdateTaskStatusDto
    {
        public string Status { get; set; } = "Pendiente";
    }
}
