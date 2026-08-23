namespace HesiasFleet.API.DTOs;

// what the client sends to connect
public class LoginDto
{
    public string Login { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// what the API returns after a successful connection
public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = new();
}