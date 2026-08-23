using HesiasFleet.API.DTOs;
using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace HesiasFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PartsController : ControllerBase
{
    private readonly IPartRepository _repository;
    private readonly IStockService _stockService;

    public PartsController(IPartRepository repository, IStockService stockService)
    {
        _repository = repository;
        _stockService = stockService;
    }

    // GET api/parts
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PartDto>>> GetAll()
    {
        var parts = await _repository.GetAllAsync();
        return Ok(parts.Select(ToDto));
    }

    // GET api/parts/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PartDto>> GetById(int id)
    {
        var part = await _repository.GetByIdAsync(id);
        if (part is null) return NotFound();
        return Ok(ToDto(part));
    }
    
    // GET api/parts/categories : known categories (autocomplete)
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        return Ok(await _repository.GetCategoriesAsync());
    }

    // GET api/parts/brands : well-known brands (autocomplete)
    [HttpGet("brands")]
    public async Task<ActionResult<IEnumerable<string>>> GetBrands()
    {
        return Ok(await _repository.GetBrandsAsync());
    }

    // GET api/parts/references : known references (autocomplete)
    [HttpGet("references")]
    public async Task<ActionResult<IEnumerable<string>>> GetReferences()
    {
        return Ok(await _repository.GetReferencesAsync());
    }

    // POST api/parts
    [HttpPost]
    public async Task<ActionResult<PartDto>> Create(CreatePartDto dto)
    {
        var part = new Part
        {
            Category = dto.Category,
            Brand = dto.Brand,
            Reference = dto.Reference,
            Minimum = dto.Minimum
        };

        var created = await _repository.CreateAsync(part);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(created));
    }
    
    // PUT api/parts/5 : correct the denomination or the minimum of a part
    // the stock (batches) is unaffected; only the part's identity is modified
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreatePartDto dto)
    {
        var part = await _repository.GetByIdAsync(id);
        if (part is null) return NotFound();

        part.Category = dto.Category;
        part.Brand = dto.Brand;
        part.Reference = dto.Reference;
        part.Minimum = dto.Minimum;

        var updated = await _repository.UpdateAsync(part);
        if (!updated) return NotFound();
        return NoContent();
    }

    // DELETE api/parts/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    // GET api/parts/5/stock : stock status (available quantity + alert)
    [HttpGet("{id}/stock")]
    public async Task<ActionResult<StockStatusDto>> GetStock(int id)
    {
        var part = await _repository.GetByIdWithStockAsync(id);
        if (part is null) return NotFound();

        var available = _stockService.GetAvailableQuantity(part);
        return Ok(new StockStatusDto
        {
            PartId = part.Id,
            Category = part.Category,
            Brand = part.Brand,
            Reference = part.Reference,
            Minimum = part.Minimum,
            AvailableQuantity = available,
            IsBelowMinimum = part.Minimum > 0 && available < part.Minimum
        });
    }

    // POST api/parts/5/stock/entry : record a stock entry
    [Authorize]
    [HttpPost("{id}/stock/entry")]
    public async Task<IActionResult> AddStock(int id, StockEntryInputDto dto)
    {
        var part = await _stockService.AddStockAsync(id, dto.Quantity, dto.UnitCost, GetCurrentUserId());
        if (part is null) return NotFound();
        return NoContent();
    }

    // POST api/parts/5/stock/consume : consume stock (FIFO stock depletion by price)
    [Authorize]
    [HttpPost("{id}/stock/consume")]
    public async Task<IActionResult> ConsumeStock(int id, StockConsumeDto dto)
    {
        var success = await _stockService.ConsumeStockAsync(id, dto.Quantity, GetCurrentUserId());
        if (!success) return BadRequest("Stock insuffisant ou pièce introuvable.");
        return NoContent();
    }

    // POST api/parts/5/stock/adjust : adjust the quantity (breakage, loss, inventory)
    [Authorize]
    [HttpPost("{id}/stock/adjust")]
    public async Task<IActionResult> AdjustStock(int id, StockAdjustDto dto)
    {
        var part = await _stockService.AdjustStockAsync(id, dto.NewQuantity, GetCurrentUserId());
        if (part is null) return NotFound();
        return NoContent();
    }

    // extracts the userId from the request's JWT (null if unauthenticated)
    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim is null) return null;
        return int.TryParse(claim.Value, out var id) ? id : null;
    }

    // Conversion entity -> DTO
    private static PartDto ToDto(Part p) => new()
    {
        Id = p.Id,
        Category = p.Category,
        Brand = p.Brand,
        Reference = p.Reference,
        Minimum = p.Minimum
    };
}