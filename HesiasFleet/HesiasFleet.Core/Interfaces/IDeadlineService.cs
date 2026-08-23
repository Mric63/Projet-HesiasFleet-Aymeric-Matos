using HesiasFleet.Core.Entities;

namespace HesiasFleet.Core.Interfaces;

public interface IDeadlineService
{
    // calculates the stop status of an operation based on the vehicle's current mileage
    DeadlineStatus? Compute(Operation operation, int currentMileage, DateTime now);
}