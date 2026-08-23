using HesiasFleet.API.DTOs;
using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HesiasFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OperationsController : ControllerBase
{
    private readonly IOperationRepository _repository;
    private readonly IStockService _stockService;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IDeadlineService _deadlineService;

    public OperationsController(
        IOperationRepository repository,
        IStockService stockService,
        IVehicleRepository vehicleRepository,
        IDeadlineService deadlineService)
    {
        _repository = repository;
        _stockService = stockService;
        _vehicleRepository = vehicleRepository;
        _deadlineService = deadlineService;
    }

    // GET api/operations
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OperationDto>>> GetAll()
    {
        var operations = await _repository.GetAllAsync();
        return Ok(operations.Select(ToDto));
    }

    // GET api/operations/vehicle/5 : vehicle log
    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IEnumerable<OperationDto>>> GetByVehicle(int vehicleId)
    {
        var operations = await _repository.GetByVehicleAsync(vehicleId);
        return Ok(operations.Select(ToDto));
    }

    // GET api/operations/vehicle/5/deadlines : a vehicle's bump stops
    [HttpGet("vehicle/{vehicleId}/deadlines")]
    public async Task<ActionResult<IEnumerable<DeadlineStatusDto>>> GetDeadlines(int vehicleId)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(vehicleId);
        if (vehicle is null) return NotFound();

        var operations = await _repository.GetByVehicleAsync(vehicleId);
        var now = DateTime.UtcNow;

        var deadlines = new List<DeadlineStatusDto>();
        foreach (var op in operations)
        {
            var status = _deadlineService.Compute(op, vehicle.Mileage, now);
            if (status is null) continue;   // operation without a stop: disregarded

            deadlines.Add(new DeadlineStatusDto
            {
                OperationId = status.OperationId,
                Label = status.Label,
                DeadlineDate = status.DeadlineDate,
                DaysRemaining = status.DaysRemaining,
                DeadlineMileage = status.DeadlineMileage,
                KilometersRemaining = status.KilometersRemaining,
                IsDue = status.IsDue
            });
        }

        return Ok(deadlines);
    }

    // GET api/operations/5
    [HttpGet("{id}")]
    public async Task<ActionResult<OperationDto>> GetById(int id)
    {
        var operation = await _repository.GetByIdAsync(id);
        if (operation is null) return NotFound();
        return Ok(ToDto(operation));
    }

    // POST api/operations
    [HttpPost]
    public async Task<ActionResult<OperationDto>> Create(CreateOperationDto dto)
    {
        // 1 check and remove stock for each consumable
        foreach (var consumable in dto.Consumables)
        {
            var success = await _stockService.ConsumeStockAsync(consumable.PartId, consumable.Quantity);
            if (!success)
                return BadRequest($"Stock insuffisant ou pièce introuvable (PartId {consumable.PartId}).");
        }

        // 2 create the operation with its consumables and free-text parts.
        var operation = new Operation
        {
            VehicleId = dto.VehicleId,
            Date = dto.Date,
            Mileage = dto.Mileage,
            Label = dto.Label,
            DeadlineDate = dto.DeadlineDate,
            DeadlineMileage = dto.DeadlineMileage,
            Consumables = dto.Consumables
                .Select(c => new OperationConsumable { PartId = c.PartId, Quantity = c.Quantity })
                .ToList(),
            SpareParts = dto.SpareParts
                .Select(sp => new OperationSparePart { Label = sp.Label, UnitCost = sp.UnitCost })
                .ToList()
        };

        var created = await _repository.CreateAsync(operation);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(created));
    }

    // DELETE api/operations/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    // Conversion entity -> DTO
    private static OperationDto ToDto(Operation o) => new()
    {
        Id = o.Id,
        VehicleId = o.VehicleId,
        Date = o.Date,
        Mileage = o.Mileage,
        Label = o.Label,
        DeadlineDate = o.DeadlineDate,
        DeadlineMileage = o.DeadlineMileage,
        Consumables = o.Consumables
            .Select(c => new OperationConsumableDto { PartId = c.PartId, Quantity = c.Quantity })
            .ToList(),
        SpareParts = o.SpareParts
            .Select(sp => new OperationSparePartDto { Label = sp.Label, UnitCost = sp.UnitCost })
            .ToList()
    };
}