using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IRepository<T> where T : BaseEntity
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> GetAllWithIncludesAsync(
            params Expression<Func<T, object>>[] includes);

        Task<T?> GetByIdAsync(Guid id);
        Task<T?> GetByIdWithIncludesAsync(
            Guid id,
            params Expression<Func<T, object>>[] includes);

        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(Guid id);
    }
}
