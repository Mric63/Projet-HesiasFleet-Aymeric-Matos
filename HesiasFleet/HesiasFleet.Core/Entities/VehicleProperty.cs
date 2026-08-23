namespace HesiasFleet.Core.Entities;

public class VehicleProperty
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;

    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;
}