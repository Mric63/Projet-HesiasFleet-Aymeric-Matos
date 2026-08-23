using HesiasFleet.Core.Entities;

namespace HesiasFleet.Core.Interfaces;

public interface IPartRepository
{
    Task<IEnumerable<Part>> GetAllAsync();
    Task<Part?> GetByIdAsync(int id);
    Task<Part> CreateAsync(Part part);
    Task<bool> UpdateAsync(Part part);
    Task<bool> DeleteAsync(int id);

    // loads a part along with its stock lots (for FIFO stock depletion)
    Task<Part?> GetByIdWithStockAsync(int id);
    // persist pending changes (movements, modified lots...)
    Task SaveChangesAsync();
    Task<IEnumerable<string>> GetCategoriesAsync();
    Task<IEnumerable<string>> GetBrandsAsync();
    Task<IEnumerable<string>> GetReferencesAsync();
}