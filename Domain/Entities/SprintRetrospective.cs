using Domain.Common;
using System;

namespace Domain.Entities
{
    public class SprintRetrospective : BaseEntity
    {
        public Guid SprintId { get; set; }

        public string WhatWentWell { get; set; } = string.Empty; // Qué aspectos funcionaron correctamente
        public string WhatWentWrong { get; set; } = string.Empty; // Qué problemas o dificultades se presentaron
        public string WhatCanBeImproved { get; set; } = string.Empty; // Qué aspectos se pueden mejorar
        public string ActionItemsJson { get; set; } = "[]"; // Acciones de mejora para el siguiente Sprint: [{ id, description, assignee, status }]

        // Propiedades de navegación
        public Sprint Sprint { get; set; } = null!;
    }
}
