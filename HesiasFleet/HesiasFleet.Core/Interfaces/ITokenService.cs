using HesiasFleet.Core.Entities;

namespace HesiasFleet.Core.Interfaces;

public interface ITokenService
{
    // generates a signed JWT for the given user
    string GenerateToken(User user);
}