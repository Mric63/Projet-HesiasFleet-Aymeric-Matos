namespace HesiasFleet.API.DTOs;

// what the API returns to the client
public class PartDto
{
    public int Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public int Minimum { get; set; }
}

// what the client sends to create a part
public class CreatePartDto
{
    public string Category { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public int Minimum { get; set; } = 0;
}