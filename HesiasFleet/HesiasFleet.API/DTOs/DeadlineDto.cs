namespace HesiasFleet.API.DTOs;

public class DeadlineStatusDto
{
    public int OperationId { get; set; }
    public string Label { get; set; } = string.Empty;

    // calendar-based cut-off date
    public DateTime? DeadlineDate { get; set; }        // date 
    public int? DaysRemaining { get; set; }            // increment (negative = late)

    // mileage marker
    public int? DeadlineMileage { get; set; }          // km 
    public int? KilometersRemaining { get; set; }      // increment (negative = exceeded)

    // true if the due date or mileage limit has been reached or exceeded (date OR km)
    public bool IsDue { get; set; }
}