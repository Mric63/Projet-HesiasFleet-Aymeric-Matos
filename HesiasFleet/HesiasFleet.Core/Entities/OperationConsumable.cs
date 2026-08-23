namespace HesiasFleet.Core.Entities;

public class OperationConsumable
{
    public int Id { get; set; }

    public int Quantity { get; set; }

    public int OperationId { get; set; }
    public Operation Operation { get; set; } = null!;

    // reference to the consumed warehouse part
    public int PartId { get; set; }
    public Part Part { get; set; } = null!;
}