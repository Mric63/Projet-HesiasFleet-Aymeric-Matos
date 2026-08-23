namespace HesiasFleet.Core.Entities;

public class OperationSparePart
{
    public int Id { get; set; }

    // standalone spare part (unlinked to the store)
    public string Label { get; set; } = string.Empty;
    public decimal? UnitCost { get; set; }   // cost price, optional

    public int OperationId { get; set; }
    public Operation Operation { get; set; } = null!;
}