using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public record RetrospectiveActionItemDto(
        string Id,
        string Description,
        string Assignee,
        string Status // "Pendiente", "En progreso", "Completado"
    );

    public record SprintRetrospectiveDto(
        Guid Id,
        Guid SprintId,
        string WhatWentWell,
        string WhatWentWrong,
        string WhatCanBeImproved,
        List<RetrospectiveActionItemDto> ActionItems,
        DateTime CreatedAt,
        DateTime? UpdatedAt
    );

    public record SaveRetrospectiveDto(
        Guid SprintId,
        string WhatWentWell,
        string WhatWentWrong,
        string WhatCanBeImproved,
        List<RetrospectiveActionItemDto> ActionItems
    );
}
