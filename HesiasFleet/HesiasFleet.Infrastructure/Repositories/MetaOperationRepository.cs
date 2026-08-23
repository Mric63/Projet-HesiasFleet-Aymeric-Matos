using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using HesiasFleet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HesiasFleet.Infrastructure.Repositories;

public class MetaOperationRepository : IMetaOperationRepository
{
    private readonly AppDbContext _context;

    public MetaOperationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MetaOperation>> GetAllAsync()
    {
        return await _context.MetaOperations
            .Include(m => m.Operations)
                .ThenInclude(o => o.Consumables)
            .Include(m => m.Operations)
                .ThenInclude(o => o.SpareParts)
            .ToListAsync();
    }

    public async Task<IEnumerable<MetaOperation>> GetByVehicleAsync(int vehicleId)
    {
        return await _context.MetaOperations
            .Include(m => m.Operations)
                .ThenInclude(o => o.Consumables)
            .Include(m => m.Operations)
                .ThenInclude(o => o.SpareParts)
            .Where(m => m.VehicleId == vehicleId)
            .OrderByDescending(m => m.Date)
            .ToListAsync();
    }

    public async Task<MetaOperation?> GetByIdAsync(int id)
    {
        return await _context.MetaOperations
            .Include(m => m.Operations)
                .ThenInclude(o => o.Consumables)
            .Include(m => m.Operations)
                .ThenInclude(o => o.SpareParts)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<MetaOperation> CreateAsync(MetaOperation metaOperation)
    {
        _context.MetaOperations.Add(metaOperation);
        await _context.SaveChangesAsync();
        return metaOperation;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var meta = await _context.MetaOperations.FindAsync(id);
        if (meta is null) return false;

        _context.MetaOperations.Remove(meta);
        await _context.SaveChangesAsync();
        return true;
    }
}