using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;

namespace HesiasFleet.Infrastructure.Services;

public class DeadlineService : IDeadlineService
{
    public DeadlineStatus? Compute(Operation operation, int currentMileage, DateTime now)
    {
        // no stop at all: nothing to calculate
        if (operation.DeadlineDate is null && operation.DeadlineMileage is null)
            return null;

        var status = new DeadlineStatus
        {
            OperationId = operation.Id,
            Label = operation.Label
        };

        // calendar-based cut-off date
        if (operation.DeadlineDate is not null)
        {
            status.DeadlineDate = operation.DeadlineDate;
            // increment in days: negative if the due date has already passed
            status.DaysRemaining = (int)(operation.DeadlineDate.Value.Date - now.Date).TotalDays;
        }

        // mileage marker
        if (operation.DeadlineMileage is not null)
        {
            status.DeadlineMileage = operation.DeadlineMileage;
            // increment in km: negative if the target mileage is exceeded
            status.KilometersRemaining = operation.DeadlineMileage.Value - currentMileage;
        }

        // the operation is "due" if at least one of the limits is reached or exceeded.
        var dueByDate = status.DaysRemaining is not null && status.DaysRemaining <= 0;
        var dueByMileage = status.KilometersRemaining is not null && status.KilometersRemaining <= 0;
        status.IsDue = dueByDate || dueByMileage;

        return status;
    }
}