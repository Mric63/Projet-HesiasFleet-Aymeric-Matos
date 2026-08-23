namespace HesiasFleet.API.DTOs;

// what the API returns
public class MetaOperationDto
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public DateTime Date { get; set; }
    public int Mileage { get; set; }
    public string Label { get; set; } = string.Empty;
    public DateTime? DeadlineDate { get; set; }
    public int? DeadlineMileage { get; set; }
    public List<OperationDto> Operations { get; set; } = new();
}

// what the client sends: the meta + its component operations
public class CreateMetaOperationDto
{
    public int VehicleId { get; set; }
    public DateTime Date { get; set; }
    public int Mileage { get; set; }
    public string Label { get; set; } = string.Empty;
    public DateTime? DeadlineDate { get; set; }
    public int? DeadlineMileage { get; set; }

    // the component operations, created simultaneously
    public List<CreateOperationDto> Operations { get; set; } = new();
}