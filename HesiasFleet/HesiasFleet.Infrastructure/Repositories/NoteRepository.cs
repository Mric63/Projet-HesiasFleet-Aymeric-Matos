using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using HesiasFleet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HesiasFleet.Infrastructure.Repositories;

public class NoteRepository : INoteRepository
{
    private readonly AppDbContext _context;

    public NoteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Note>> GetByVehicleAsync(int vehicleId)
    {
        return await _context.Notes
            .Where(n => n.VehicleId == vehicleId)
            .OrderByDescending(n => n.Date)
            .ToListAsync();
    }

    public async Task<Note?> GetByIdAsync(int id)
    {
        return await _context.Notes.FindAsync(id);
    }

    public async Task<Note> CreateAsync(Note note)
    {
        _context.Notes.Add(note);
        await _context.SaveChangesAsync();
        return note;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note is null) return false;

        _context.Notes.Remove(note);
        await _context.SaveChangesAsync();
        return true;
    }
}