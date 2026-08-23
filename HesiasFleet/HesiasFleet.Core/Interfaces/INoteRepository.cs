using HesiasFleet.Core.Entities;

namespace HesiasFleet.Core.Interfaces;

public interface INoteRepository
{
    Task<IEnumerable<Note>> GetByVehicleAsync(int vehicleId);
    Task<Note?> GetByIdAsync(int id);
    Task<Note> CreateAsync(Note note);
    Task<bool> DeleteAsync(int id);
}