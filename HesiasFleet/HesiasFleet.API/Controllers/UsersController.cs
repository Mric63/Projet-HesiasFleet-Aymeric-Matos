using HesiasFleet.API.DTOs;
using HesiasFleet.Core.Entities;
using HesiasFleet.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HesiasFleet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _repository;

    public UsersController(IUserRepository repository)
    {
        _repository = repository;
    }

    // GET api/users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await _repository.GetAllAsync();
        var dtos = users.Select(ToDto);
        return Ok(dtos);
    }

    // GET api/users/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user is null) return NotFound();
        return Ok(ToDto(user));
    }

    // POST api/users
    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(CreateUserDto dto)
    {
        var user = new User
        {
            LastName = dto.LastName,
            FirstName = dto.FirstName,
            Function = dto.Function,
            Email = dto.Email,
            Login = dto.Login,
            // password hashing before storage (never in plain text)
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        var created = await _repository.CreateAsync(user);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(created));
    }

    // DELETE api/users/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    // Conversion entity -> DTO (never exposes the hash)
    private static UserDto ToDto(User user) => new()
    {
        Id = user.Id,
        LastName = user.LastName,
        FirstName = user.FirstName,
        Function = user.Function,
        Email = user.Email,
        Login = user.Login
    };
}