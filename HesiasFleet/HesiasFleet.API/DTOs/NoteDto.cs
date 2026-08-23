namespace HesiasFleet.API.DTOs;

// what the API returns
public class NoteDto
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int? Mileage { get; set; }
    public int? OperationId { get; set; }
    public int? MetaOperationId { get; set; }
}

// what the client sends
public class CreateNoteDto
{
    public int VehicleId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int? Mileage { get; set; }

    // optional: link the note to a transaction or meta-transaction
    public int? OperationId { get; set; }
    public int? MetaOperationId { get; set; }
}