using Domain.Common;
using System;

namespace Domain.Entities
{
    public class SprintRetrospective : BaseEntity
    {
        public Guid SprintId { get; set; }
        public string WhatWentWell { get; set; } = string.Empty; // Qué salió bien
        public string WhatWentWrong { get; set; } = string.Empty; // Qué salió mal / Dificultades
        public string CompletedSummary { get; set; } = string.Empty; // Qué se terminó
        public string PendingSummary { get; set; } = string.Empty; // Qué quedó pendiente
        public string Agreements { get; set; } = string.Empty; // Acuerdos y lecciones aprendidas

        public Sprint Sprint { get; set; } = null!;
    }
}
