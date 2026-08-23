namespace HesiasFleet.Core.Entities;

public class Operation
{
    public int Id { get; set; }

    public DateTime Date { get; set; }
    public int Mileage { get; set; }
    public string Label { get; set; } = string.Empty;   // e.g. oil filter replacement

    // time at which the operation must be repeated
    public DateTime? DeadlineDate { get; set; }
    public int? DeadlineMileage { get; set; }

    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;

    // an operation can belong to zero or one meta-operation
    public int? MetaOperationId { get; set; }
    public MetaOperation? MetaOperation { get; set; }

    // shop consumables (stock issues) and free-issue parts
    public ICollection<OperationConsumable> Consumables { get; set; } = new List<OperationConsumable>();
    public ICollection<OperationSparePart> SpareParts { get; set; } = new List<OperationSparePart>();
}