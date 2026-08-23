namespace HesiasFleet.Core.Entities;

public class Vehicle
{
    public int Id { get; set; }

    // old and new registration formats—subject to nullification, as some vehicles are not registered
    public string? RegistrationOld { get; set; }
    public string? RegistrationNew { get; set; }

    // custom identifier chosen by the operator if not registered
    public string? CustomIdentifier { get; set; }

    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Mileage { get; set; }

    public ICollection<VehicleProperty> Properties { get; set; } = new List<VehicleProperty>();
    public ICollection<Operation> Operations { get; set; } = new List<Operation>();
    public ICollection<MetaOperation> MetaOperations { get; set; } = new List<MetaOperation>();
    public ICollection<Note> Notes { get; set; } = new List<Note>();
}