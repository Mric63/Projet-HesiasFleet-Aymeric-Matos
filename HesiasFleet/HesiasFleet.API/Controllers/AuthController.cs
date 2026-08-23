using HesiasFleet.API.DTOs;
using HesiasFleet.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HesiasFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public AuthController(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _userRepository.GetByLoginAsync(dto.Login);

        // non-existent user OR incorrect password: same response
        // (we are not revealing which of the two it is, for security reasons.)
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Login ou mot de passe incorrect.");

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                LastName = user.LastName,
                FirstName = user.FirstName,
                Function = user.Function,
                Email = user.Email,
                Login = user.Login
            }
        });
    }
}