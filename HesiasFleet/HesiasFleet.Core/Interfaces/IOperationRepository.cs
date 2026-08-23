using HesiasFleet.Core.Entities;

namespace HesiasFleet.Core.Interfaces;

public interface IOperationRepository
{
    Task<IEnumerable<Operation>> GetAllAsync();
    Task<IEnumerable<Operation>> GetByVehicleAsync(int vehicleId);
    Task<Operation?> GetByIdAsync(int id);
    Task<Operation> CreateAsync(Operation operation);
    Task<bool> UpdateAsync(Operation operation);
    Task<bool> DeleteAsync(int id);
}