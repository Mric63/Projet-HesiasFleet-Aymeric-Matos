using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using HesiasFleet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HesiasFleet.Infrastructure.Services;

public class StockService : IStockService
{
    private readonly AppDbContext _context;
    private readonly IPartRepository _partRepository;

    public StockService(AppDbContext context, IPartRepository partRepository)
    {
        _context = context;
        _partRepository = partRepository;
    }

    // retrieves (or creates) the system user used when authentication is not active
    private async Task<int> GetSystemUserIdAsync()
    {
        var system = await _context.Users.FirstOrDefaultAsync(u => u.Login == "system");
        if (system is null)
        {
            system = new User
            {
                LastName = "Système",
                FirstName = "Compte",
                Function = "Système",
                Email = "system@hesias.fr",
                Login = "system",
                PasswordHash = string.Empty
            };
            _context.Users.Add(system);
            await _context.SaveChangesAsync();
        }
        return system.Id;
    }

    public int GetAvailableQuantity(Part part)
    {
        // sum of the remaining quantities of all batches
        return part.StockEntries.Sum(e => e.Quantity);
    }

    public async Task<Part?> AddStockAsync(int partId, int quantity, decimal unitCost, int? userId = null)
    {
        var part = await _partRepository.GetByIdWithStockAsync(partId);
        if (part is null) return null;

        var uid = userId ?? await GetSystemUserIdAsync();

        // new stock batch
        var entry = new StockEntry
        {
            PartId = partId,
            Quantity = quantity,
            UnitCost = unitCost,
            CreatedAt = DateTime.UtcNow,
            UserId = uid
        };
        _context.StockEntries.Add(entry);

        // trace the movement (input)
        _context.StockMovements.Add(new StockMovement
        {
            PartId = partId,
            Type = StockMovementType.Entry,
            Quantity = quantity,
            UnitCost = unitCost,
            Timestamp = DateTime.UtcNow,
            UserId = uid
        });

        await _partRepository.SaveChangesAsync();
        return await _partRepository.GetByIdWithStockAsync(partId);
    }

    public async Task<bool> ConsumeStockAsync(int partId, int quantity, int? userId = null)
    {
        var part = await _partRepository.GetByIdWithStockAsync(partId);
        if (part is null) return false;

        // insufficient stock: consumption refused
        if (GetAvailableQuantity(part) < quantity) return false;

        var uid = userId ?? await GetSystemUserIdAsync();
        var remaining = quantity;

        // FIFO stock clearance by PRICE: the cheapest batches are cleared first
        var lots = part.StockEntries
            .Where(e => e.Quantity > 0)
            .OrderBy(e => e.UnitCost)
            .ThenBy(e => e.CreatedAt)
            .ToList();

        foreach (var lot in lots)
        {
            if (remaining <= 0) break;

            var taken = Math.Min(lot.Quantity, remaining);
            lot.Quantity -= taken;
            remaining -= taken;

            // track the movement (consumption, negative quantity)
            _context.StockMovements.Add(new StockMovement
            {
                PartId = partId,
                Type = StockMovementType.Consumption,
                Quantity = -taken,
                UnitCost = lot.UnitCost,
                Timestamp = DateTime.UtcNow,
                UserId = uid
            });
        }

        await _partRepository.SaveChangesAsync();
        return true;
    }

    public async Task<Part?> AdjustStockAsync(int partId, int newQuantity, int? userId = null)
    {
        var part = await _partRepository.GetByIdWithStockAsync(partId);
        if (part is null) return null;

        var uid = userId ?? await GetSystemUserIdAsync();
        var current = GetAvailableQuantity(part);
        var diff = newQuantity - current;

        if (diff == 0) return part;

        if (diff > 0)
        {
            // the difference is added as a zero-cost batch (positive adjustment)
            _context.StockEntries.Add(new StockEntry
            {
                PartId = partId,
                Quantity = diff,
                UnitCost = 0m,
                CreatedAt = DateTime.UtcNow,
                UserId = uid
            });
        }
        else
        {
            // negative adjustment: deductions are made starting with the lowest-cost lots
            var toRemove = -diff;
            var lots = part.StockEntries
                .Where(e => e.Quantity > 0)
                .OrderBy(e => e.UnitCost)
                .ThenBy(e => e.CreatedAt)
                .ToList();

            foreach (var lot in lots)
            {
                if (toRemove <= 0) break;
                var taken = Math.Min(lot.Quantity, toRemove);
                lot.Quantity -= taken;
                toRemove -= taken;
            }
        }

        // trace the movement (adjustment)
        _context.StockMovements.Add(new StockMovement
        {
            PartId = partId,
            Type = StockMovementType.Adjustment,
            Quantity = diff,
            UnitCost = 0m,
            Timestamp = DateTime.UtcNow,
            UserId = uid
        });

        await _partRepository.SaveChangesAsync();
        return await _partRepository.GetByIdWithStockAsync(partId);
    }
}