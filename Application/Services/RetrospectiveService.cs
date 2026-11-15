using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class RetrospectiveService : IRetrospectiveService
    {
        private readonly IRepository<SprintRetrospective> _retroRepository;
        private readonly IRepository<Sprint> _sprintRepository;
        private readonly IMapper _mapper;

        public RetrospectiveService(
            IRepository<SprintRetrospective> retroRepository,
            IRepository<Sprint> sprintRepository,
            IMapper mapper)
        {
            _retroRepository = retroRepository;
            _sprintRepository = sprintRepository;
            _mapper = mapper;
        }

        public async Task<SprintRetrospectiveDto?> GetBySprintAsync(Guid sprintId)
        {
            var retro = (await _retroRepository.GetAllAsync())
                .FirstOrDefault(x => x.SprintId == sprintId);

            return retro == null ? null : _mapper.Map<SprintRetrospectiveDto>(retro);
        }

        public async Task<SprintRetrospectiveDto> SaveAsync(SaveRetrospectiveDto dto)
        {
            var sprint = await _sprintRepository.GetByIdAsync(dto.SprintId);
            if (sprint == null)
                throw new ArgumentException("El Sprint especificado no existe.");

            var existing = (await _retroRepository.GetAllAsync())
                .FirstOrDefault(x => x.SprintId == dto.SprintId);

            var actionJson = JsonSerializer.Serialize(dto.ActionItems ?? new List<RetrospectiveActionItemDto>());

            if (existing != null)
            {
                existing.WhatWentWell = dto.WhatWentWell ?? string.Empty;
                existing.WhatWentWrong = dto.WhatWentWrong ?? string.Empty;
                existing.WhatCanBeImproved = dto.WhatCanBeImproved ?? string.Empty;
                existing.ActionItemsJson = actionJson;

                await _retroRepository.UpdateAsync(existing);
                return _mapper.Map<SprintRetrospectiveDto>(existing);
            }
            else
            {
                var newRetro = new SprintRetrospective
                {
                    Id = Guid.NewGuid(),
                    SprintId = dto.SprintId,
                    WhatWentWell = dto.WhatWentWell ?? string.Empty,
                    WhatWentWrong = dto.WhatWentWrong ?? string.Empty,
                    WhatCanBeImproved = dto.WhatCanBeImproved ?? string.Empty,
                    ActionItemsJson = actionJson
                };

                var created = await _retroRepository.AddAsync(newRetro);
                return _mapper.Map<SprintRetrospectiveDto>(created);
            }
        }
    }
}
