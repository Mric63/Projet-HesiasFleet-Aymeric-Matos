namespace HesiasFleet.Core.Entities;

public enum StockMovementType
{
    Entry,       // entry stock
    Consumption, // consumption during an operation
    Adjustment   // manual adjustment (breakage, loss)
}

public class StockMovement
{
    public int Id { get; set; }

    public StockMovementType Type { get; set; }
    public int Quantity { get; set; }              // positive = addition, negative = removal
    public decimal UnitCost { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public int PartId { get; set; }
    public Part Part { get; set; } = null!;

    // all stock operations are identified (which user).
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}