namespace HesiasFleet.API.DTOs;

// stock receipt: a quantity and a unit price are received
public class StockEntryInputDto
{
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
}

// stock consumption: a quantity is removed (FIFO stock reduction based on price)
public class StockConsumeDto
{
    public int Quantity { get; set; }
}

// adjustment: overriding the available quantity (breakage, loss, inventory)
public class StockAdjustDto
{
    public int NewQuantity { get; set; }
}

// what the API returns to describe the stock status of a part
public class StockStatusDto
{
    public int PartId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public int Minimum { get; set; }
    public int AvailableQuantity { get; set; }   // somme des lots
    public bool IsBelowMinimum { get; set; }      // alerte de stock
}