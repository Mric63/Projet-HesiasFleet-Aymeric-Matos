namespace HesiasFleet.API.DTOs;

// consumable: references a store item + quantity
public class OperationConsumableDto
{
    public int PartId { get; set; }
    public int Quantity { get; set; }
}

// free-form entry (entered on the fly, not linked to the store)
public class OperationSparePartDto
{
    public string Label { get; set; } = string.Empty;
    public decimal? UnitCost { get; set; }
}

// what the API returns
public class OperationDto
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public DateTime Date { get; set; }
    public int Mileage { get; set; }
    public string Label { get; set; } = string.Empty;
    public DateTime? DeadlineDate { get; set; }
    public int? DeadlineMileage { get; set; }
    public List<OperationConsumableDto> Consumables { get; set; } = new();
    public List<OperationSparePartDto> SpareParts { get; set; } = new();
}

// what the client sends to create an operation
public class CreateOperationDto
{
    public int VehicleId { get; set; }
    public DateTime Date { get; set; }
    public int Mileage { get; set; }
    public string Label { get; set; } = string.Empty;
    public DateTime? DeadlineDate { get; set; }
    public int? DeadlineMileage { get; set; }
    public List<OperationConsumableDto> Consumables { get; set; } = new();
    public List<OperationSparePartDto> SpareParts { get; set; } = new();
}