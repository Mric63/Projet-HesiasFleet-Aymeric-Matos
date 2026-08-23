using HesiasFleet.Core.Entities;

namespace HesiasFleet.Core.Interfaces;

public interface IVehicleRepository
{
    Task<IEnumerable<Vehicle>> GetAllAsync();
    Task<Vehicle?> GetByIdAsync(int id);
    Task<Vehicle> CreateAsync(Vehicle vehicle);
    Task<bool> UpdateAsync(Vehicle vehicle);
    Task<bool> DeleteAsync(int id);
    
    // loads all vehicles along with their operations (for notification calculation)
    Task<IEnumerable<Vehicle>> GetAllWithOperationsAsync();
}