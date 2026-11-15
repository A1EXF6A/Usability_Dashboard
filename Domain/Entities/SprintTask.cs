using Domain.Common;
using System;

namespace Domain.Entities
{
    public class SprintTask : BaseEntity
    {
        public Guid SprintId { get; set; }
        public Guid? UserStoryId { get; set; }

        public string TaskCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedHours { get; set; } = 4;
        public string Status { get; set; } = "Pendiente"; // Pendiente, En progreso, En revisión, Terminado
        public string Assignee { get; set; } = "Sin asignar";
        public int Order { get; set; } = 0;

        // Propiedades de navegación
        public Sprint Sprint { get; set; } = null!;
        public UserStory? UserStory { get; set; }
    }
}
