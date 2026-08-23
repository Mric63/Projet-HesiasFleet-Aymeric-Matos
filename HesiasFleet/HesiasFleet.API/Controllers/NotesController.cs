using HesiasFleet.API.DTOs;
using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HesiasFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly INoteRepository _repository;

    public NotesController(INoteRepository repository)
    {
        _repository = repository;
    }

    // GET api/notes/vehicle/5 : Vehicle rating
    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IEnumerable<NoteDto>>> GetByVehicle(int vehicleId)
    {
        var notes = await _repository.GetByVehicleAsync(vehicleId);
        return Ok(notes.Select(ToDto));
    }

    // GET api/notes/5
    [HttpGet("{id}")]
    public async Task<ActionResult<NoteDto>> GetById(int id)
    {
        var note = await _repository.GetByIdAsync(id);
        if (note is null) return NotFound();
        return Ok(ToDto(note));
    }

    // POST api/notes
    [HttpPost]
    public async Task<ActionResult<NoteDto>> Create(CreateNoteDto dto)
    {
        var note = new Note
        {
            VehicleId = dto.VehicleId,
            Content = dto.Content,
            Date = dto.Date,
            Mileage = dto.Mileage,
            OperationId = dto.OperationId,
            MetaOperationId = dto.MetaOperationId
        };

        var created = await _repository.CreateAsync(note);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(created));
    }

    // DELETE api/notes/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    // entity conversion -> DTO
    private static NoteDto ToDto(Note n) => new()
    {
        Id = n.Id,
        VehicleId = n.VehicleId,
        Content = n.Content,
        Date = n.Date,
        Mileage = n.Mileage,
        OperationId = n.OperationId,
        MetaOperationId = n.MetaOperationId
    };
}