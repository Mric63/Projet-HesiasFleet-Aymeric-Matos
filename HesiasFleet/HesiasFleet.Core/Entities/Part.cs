namespace HesiasFleet.Core.Entities;

public class Part
{
    public int Id { get; set; }

    // identification: category - brand - reference
    public string Category { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;

    // stock alert threshold, 0 by default (no alert)
    public int Minimum { get; set; } = 0;

    // stock batches (each with its own price) for FIFO stock clearance
    public ICollection<StockEntry> StockEntries { get; set; } = new List<StockEntry>();
    public ICollection<StockMovement> Movements { get; set; } = new List<StockMovement>();
}