namespace HesiasFleet.API.DTOs;

// an expired stop-loss notification
public class NotificationDto
{
    public int VehicleId { get; set; }
    public string VehicleLabel { get; set; } = string.Empty;  // make/model/registration for display
    public int OperationId { get; set; }
    public string OperationLabel { get; set; } = string.Empty;

    public DateTime? DeadlineDate { get; set; }
    public int? DaysRemaining { get; set; }
    public int? DeadlineMileage { get; set; }
    public int? KilometersRemaining { get; set; }
}