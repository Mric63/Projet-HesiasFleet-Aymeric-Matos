namespace HesiasFleet.Core.Entities;

// calculation result for a retaining wall (not a table: in-memory business object)
public class DeadlineStatus
{
    public int OperationId { get; set; }
    public string Label { get; set; } = string.Empty;

    public DateTime? DeadlineDate { get; set; }
    public int? DaysRemaining { get; set; }

    public int? DeadlineMileage { get; set; }
    public int? KilometersRemaining { get; set; }

    public bool IsDue { get; set; }
}