namespace HesiasFleet.API.DTOs;

// An extended property (bonus: engine type, gearbox, etc.)
public class VehiclePropertyDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

// what api send to client
public class VehicleDto
{
    public int Id { get; set; }
    public string? RegistrationOld { get; set; }
    public string? RegistrationNew { get; set; }
    public string? CustomIdentifier { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Mileage { get; set; }
    public List<VehiclePropertyDto> Properties { get; set; } = new();
}

// what the client sends to create a vehicle
public class CreateVehicleDto
{
    public string? RegistrationOld { get; set; }
    public string? RegistrationNew { get; set; }
    public string? CustomIdentifier { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Mileage { get; set; }
    public List<VehiclePropertyDto> Properties { get; set; } = new();
}

// mileage update (called by the external telematics solution)
public class UpdateMileageDto
{
    public int Mileage { get; set; }
}