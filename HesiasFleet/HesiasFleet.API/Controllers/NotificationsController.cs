using HesiasFleet.API.DTOs;
using HesiasFleet.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HesiasFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IDeadlineService _deadlineService;

    public NotificationsController(
        IVehicleRepository vehicleRepository,
        IDeadlineService deadlineService)
    {
        _vehicleRepository = vehicleRepository;
        _deadlineService = deadlineService;
    }

    // GET api/notifications : all expired service-life limits across the fleet
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetDueDeadlines()
    {
        var vehicles = await _vehicleRepository.GetAllWithOperationsAsync();
        var now = DateTime.UtcNow;
        var notifications = new List<NotificationDto>();

        foreach (var vehicle in vehicles)
        {
            foreach (var operation in vehicle.Operations)
            {
                var status = _deadlineService.Compute(operation, vehicle.Mileage, now);

                // only the deadlines that have been reached or exceeded are retained.
                if (status is null || !status.IsDue) continue;

                notifications.Add(new NotificationDto
                {
                    VehicleId = vehicle.Id,
                    VehicleLabel = BuildVehicleLabel(vehicle.Brand, vehicle.Model,
                        vehicle.RegistrationNew ?? vehicle.CustomIdentifier),
                    OperationId = status.OperationId,
                    OperationLabel = status.Label,
                    DeadlineDate = status.DeadlineDate,
                    DaysRemaining = status.DaysRemaining,
                    DeadlineMileage = status.DeadlineMileage,
                    KilometersRemaining = status.KilometersRemaining
                });
            }
        }

        // the most urgent ones first (starting with the most significant delays)
        var ordered = notifications
            .OrderBy(n => n.KilometersRemaining ?? int.MaxValue)
            .ThenBy(n => n.DaysRemaining ?? int.MaxValue);

        return Ok(ordered);
    }

    // constructs a readable label for the vehicle
    private static string BuildVehicleLabel(string brand, string model, string? identifier)
    {
        var label = $"{brand} {model}".Trim();
        return string.IsNullOrWhiteSpace(identifier) ? label : $"{label} ({identifier})";
    }
}