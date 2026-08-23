using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using HesiasFleet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HesiasFleet.Infrastructure.Repositories;

public class OperationRepository : IOperationRepository
{
    private readonly AppDbContext _context;

    public OperationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Operation>> GetAllAsync()
    {
        return await _context.Operations
            .Include(o => o.SpareParts)
            .Include(o => o.Consumables)
            .ToListAsync();
    }

    public async Task<IEnumerable<Operation>> GetByVehicleAsync(int vehicleId)
    {
        return await _context.Operations
            .Include(o => o.SpareParts)
            .Include(o => o.Consumables)
            .Where(o => o.VehicleId == vehicleId)
            .OrderByDescending(o => o.Date)
            .ToListAsync();
    }

    public async Task<Operation?> GetByIdAsync(int id)
    {
        return await _context.Operations
            .Include(o => o.SpareParts)
            .Include(o => o.Consumables)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Operation> CreateAsync(Operation operation)
    {
        _context.Operations.Add(operation);
        await _context.SaveChangesAsync();
        return operation;
    }

    public async Task<bool> UpdateAsync(Operation operation)
    {
        _context.Operations.Update(operation);
        var affected = await _context.SaveChangesAsync();
        return affected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var operation = await _context.Operations.FindAsync(id);
        if (operation is null) return false;

        _context.Operations.Remove(operation);
        await _context.SaveChangesAsync();
        return true;
    }
}