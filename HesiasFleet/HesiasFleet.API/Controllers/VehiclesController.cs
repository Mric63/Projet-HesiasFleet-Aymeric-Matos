using HesiasFleet.API.DTOs;
using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HesiasFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleRepository _repository;

    public VehiclesController(IVehicleRepository repository)
    {
        _repository = repository;
    }

    // GET api/vehicles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VehicleDto>>> GetAll()
    {
        var vehicles = await _repository.GetAllAsync();
        return Ok(vehicles.Select(ToDto));
    }

    // GET api/vehicles/5
    [HttpGet("{id}")]
    public async Task<ActionResult<VehicleDto>> GetById(int id)
    {
        var vehicle = await _repository.GetByIdAsync(id);
        if (vehicle is null) return NotFound();
        return Ok(ToDto(vehicle));
    }

    // POST api/vehicles
    [HttpPost]
    public async Task<ActionResult<VehicleDto>> Create(CreateVehicleDto dto)
    {
        var vehicle = new Vehicle
        {
            RegistrationOld = dto.RegistrationOld,
            RegistrationNew = dto.RegistrationNew,
            CustomIdentifier = dto.CustomIdentifier,
            Brand = dto.Brand,
            Model = dto.Model,
            Mileage = dto.Mileage,
            Properties = dto.Properties
                .Select(p => new VehicleProperty { Key = p.Key, Value = p.Value })
                .ToList()
        };

        var created = await _repository.CreateAsync(vehicle);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(created));
    }
    
    // PATCH api/vehicles/5/mileage : mileage update
    [HttpPatch("{id}/mileage")]
    public async Task<IActionResult> UpdateMileage(int id, UpdateMileageDto dto)
    {
        var vehicle = await _repository.GetByIdAsync(id);
        if (vehicle is null) return NotFound();

        vehicle.Mileage = dto.Mileage;

        var updated = await _repository.UpdateAsync(vehicle);
        if (!updated) return NotFound();
        return NoContent();
    }

    // PUT api/vehicles/5
    [HttpPut("{id}")]
    public async Task<ActionResult<VehicleDto>> Update(int id, CreateVehicleDto dto)
    {
        // reconstruct the entity using the route ID, not any ID that might be present in the body.
        var vehicle = new Vehicle
        {
            Id = id,
            RegistrationOld = dto.RegistrationOld,
            RegistrationNew = dto.RegistrationNew,
            CustomIdentifier = dto.CustomIdentifier,
            Brand = dto.Brand,
            Model = dto.Model,
            Mileage = dto.Mileage,
            Properties = dto.Properties
                .Select(p => new VehicleProperty { Key = p.Key, Value = p.Value })
                .ToList()
        };

        var updated = await _repository.UpdateAsync(vehicle);
        if (!updated) return NotFound();

        // the up-to-date state, reloaded from the database, is returned
        var refreshed = await _repository.GetByIdAsync(id);
        return Ok(ToDto(refreshed!));
    }

    // DELETE api/vehicles/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    // Conversion entity -> DTO
    private static VehicleDto ToDto(Vehicle v) => new()
    {
        Id = v.Id,
        RegistrationOld = v.RegistrationOld,
        RegistrationNew = v.RegistrationNew,
        CustomIdentifier = v.CustomIdentifier,
        Brand = v.Brand,
        Model = v.Model,
        Mileage = v.Mileage,
        Properties = v.Properties
            .Select(p => new VehiclePropertyDto { Key = p.Key, Value = p.Value })
            .ToList()
    };
}