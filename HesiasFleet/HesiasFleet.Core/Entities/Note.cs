namespace HesiasFleet.Core.Entities;

public class Note
{
    public int Id { get; set; }

    public string Content { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int? Mileage { get; set; }

    // note always belongs to a vehicle (an entry in its log)
    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;

    // optionally linked to an operation or a meta-operation
    public int? OperationId { get; set; }
    public Operation? Operation { get; set; }

    public int? MetaOperationId { get; set; }
    public MetaOperation? MetaOperation { get; set; }
}