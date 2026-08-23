using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using HesiasFleet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HesiasFleet.Infrastructure.Repositories;

public class VehicleRepository : IVehicleRepository
{
    private readonly AppDbContext _context;

    public VehicleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Vehicle>> GetAllAsync()
    {
        // Include charge aussi les propriétés étendues liées
        return await _context.Vehicles
            .Include(v => v.Properties)
            .ToListAsync();
    }

    public async Task<Vehicle?> GetByIdAsync(int id)
    {
        return await _context.Vehicles
            .Include(v => v.Properties)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<Vehicle> CreateAsync(Vehicle vehicle)
    {
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();
        return vehicle;
    }

    public async Task<bool> UpdateAsync(Vehicle vehicle)
    {
        // reload the vehicle tracked by EF with its properties,
        // in order to apply the changes to the existing entity rather
        // than attaching a new detached object
        var existing = await _context.Vehicles
            .Include(v => v.Properties)
            .FirstOrDefaultAsync(v => v.Id == vehicle.Id);

        if (existing is null) return false;

        // champs scalaires
        existing.RegistrationOld = vehicle.RegistrationOld;
        existing.RegistrationNew = vehicle.RegistrationNew;
        existing.CustomIdentifier = vehicle.CustomIdentifier;
        existing.Brand = vehicle.Brand;
        existing.Model = vehicle.Model;
        existing.Mileage = vehicle.Mileage;

        // complete replacement of expanded properties: remove the
        // old ones and insert the new ones; otherwise, EF would leave
        // orphaned rows in the database
        _context.VehicleProperties.RemoveRange(existing.Properties);
        existing.Properties = vehicle.Properties
            .Select(p => new VehicleProperty { Key = p.Key, Value = p.Value })
            .ToList();

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle is null) return false;

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Vehicle>> GetAllWithOperationsAsync()
    {
        return await _context.Vehicles
            .Include(v => v.Operations)
            .ToListAsync();
    }
}