using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using HesiasFleet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HesiasFleet.Infrastructure.Repositories;

public class PartRepository : IPartRepository
{
    private readonly AppDbContext _context;

    public PartRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Part>> GetAllAsync()
    {
        return await _context.Parts.ToListAsync();
    }

    public async Task<Part?> GetByIdAsync(int id)
    {
        return await _context.Parts.FindAsync(id);
    }

    public async Task<Part> CreateAsync(Part part)
    {
        _context.Parts.Add(part);
        await _context.SaveChangesAsync();
        return part;
    }

    public async Task<bool> UpdateAsync(Part part)
    {
        _context.Parts.Update(part);
        var affected = await _context.SaveChangesAsync();
        return affected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var part = await _context.Parts.FindAsync(id);
        if (part is null) return false;

        _context.Parts.Remove(part);
        await _context.SaveChangesAsync();
        return true;
    }
    
    public async Task<Part?> GetByIdWithStockAsync(int id)
    {
        return await _context.Parts
            .Include(p => p.StockEntries)
            .Include(p => p.Movements)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
    
    public async Task<IEnumerable<string>> GetCategoriesAsync()
    {
        return await _context.Parts
            .Select(p => p.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
    }

    public async Task<IEnumerable<string>> GetBrandsAsync()
    {
        return await _context.Parts
            .Select(p => p.Brand)
            .Distinct()
            .OrderBy(b => b)
            .ToListAsync();
    }

    public async Task<IEnumerable<string>> GetReferencesAsync()
    {
        return await _context.Parts
            .Select(p => p.Reference)
            .Distinct()
            .OrderBy(r => r)
            .ToListAsync();
    }
}