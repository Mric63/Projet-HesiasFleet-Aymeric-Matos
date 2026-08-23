using HesiasFleet.Core.Entities;

namespace HesiasFleet.Core.Interfaces;

public interface IMetaOperationRepository
{
    Task<IEnumerable<MetaOperation>> GetAllAsync();
    Task<IEnumerable<MetaOperation>> GetByVehicleAsync(int vehicleId);
    Task<MetaOperation?> GetByIdAsync(int id);
    Task<MetaOperation> CreateAsync(MetaOperation metaOperation);
    Task<bool> DeleteAsync(int id);
}