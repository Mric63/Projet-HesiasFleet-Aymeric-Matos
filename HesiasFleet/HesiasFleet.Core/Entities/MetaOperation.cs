namespace HesiasFleet.Core.Entities;

public class MetaOperation
{
    public int Id { get; set; }

    public DateTime Date { get; set; }
    public int Mileage { get; set; }
    public string Label { get; set; } = string.Empty;   // e.g. Engine oil change

    // a stop can be placed on the meta-operation rather than on its components.
    public DateTime? DeadlineDate { get; set; }
    public int? DeadlineMileage { get; set; }

    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;

    // the operations grouped by this meta-operation
    public ICollection<Operation> Operations { get; set; } = new List<Operation>();
}