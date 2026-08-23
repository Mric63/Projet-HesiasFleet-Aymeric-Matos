namespace HesiasFleet.Core.Entities;

public class StockEntry
{
    public int Id { get; set; }

    public int Quantity { get; set; }              
    public decimal UnitCost { get; set; }         
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int PartId { get; set; }
    public Part Part { get; set; } = null!;

    // who entered the data?
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}