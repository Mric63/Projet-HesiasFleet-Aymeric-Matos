using HesiasFleet.API.DTOs;
using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HesiasFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetaOperationsController : ControllerBase
{
    private readonly IMetaOperationRepository _repository;
    private readonly IStockService _stockService;

    public MetaOperationsController(IMetaOperationRepository repository, IStockService stockService)
    {
        _repository = repository;
        _stockService = stockService;
    }

    // GET api/metaoperations
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MetaOperationDto>>> GetAll()
    {
        var metas = await _repository.GetAllAsync();
        return Ok(metas.Select(ToDto));
    }

    // GET api/metaoperations/vehicle/5
    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IEnumerable<MetaOperationDto>>> GetByVehicle(int vehicleId)
    {
        var metas = await _repository.GetByVehicleAsync(vehicleId);
        return Ok(metas.Select(ToDto));
    }

    // GET api/metaoperations/5
    [HttpGet("{id}")]
    public async Task<ActionResult<MetaOperationDto>> GetById(int id)
    {
        var meta = await _repository.GetByIdAsync(id);
        if (meta is null) return NotFound();
        return Ok(ToDto(meta));
    }

    // POST api/metaoperations
    [HttpPost]
    public async Task<ActionResult<MetaOperationDto>> Create(CreateMetaOperationDto dto)
    {
        // 1 consume stock for each consumable of each component operation.
        foreach (var opDto in dto.Operations)
        {
            foreach (var consumable in opDto.Consumables)
            {
                var success = await _stockService.ConsumeStockAsync(consumable.PartId, consumable.Quantity);
                if (!success)
                    return BadRequest($"Stock insuffisant ou pièce introuvable (PartId {consumable.PartId}).");
            }
        }

        // 2 construct the meta-operation and its components.
        var meta = new MetaOperation
        {
            VehicleId = dto.VehicleId,
            Date = dto.Date,
            Mileage = dto.Mileage,
            Label = dto.Label,
            DeadlineDate = dto.DeadlineDate,
            DeadlineMileage = dto.DeadlineMileage,
            Operations = dto.Operations.Select(opDto => new Operation
            {
                // component vehicle = meta vehicle
                VehicleId = dto.VehicleId,
                Date = opDto.Date,
                Mileage = opDto.Mileage,
                Label = opDto.Label,
                DeadlineDate = opDto.DeadlineDate,
                DeadlineMileage = opDto.DeadlineMileage,
                Consumables = opDto.Consumables
                    .Select(c => new OperationConsumable { PartId = c.PartId, Quantity = c.Quantity })
                    .ToList(),
                SpareParts = opDto.SpareParts
                    .Select(sp => new OperationSparePart { Label = sp.Label, UnitCost = sp.UnitCost })
                    .ToList()
            }).ToList()
        };

        var created = await _repository.CreateAsync(meta);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(created));
    }

    // DELETE api/metaoperations/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    // Conversion entity -> DTO
    private static MetaOperationDto ToDto(MetaOperation m) => new()
    {
        Id = m.Id,
        VehicleId = m.VehicleId,
        Date = m.Date,
        Mileage = m.Mileage,
        Label = m.Label,
        DeadlineDate = m.DeadlineDate,
        DeadlineMileage = m.DeadlineMileage,
        Operations = m.Operations.Select(o => new OperationDto
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
        }).ToList()
    };
}