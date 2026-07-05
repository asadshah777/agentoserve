using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;

    public UserController(
        ApplicationDbContext context,
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration config)
    {
        _userManager = userManager;
        _context = context;
        _roleManager = roleManager;
        _config = config;
    }

    [HttpPost("Create", Name = "CreateUser")]
    public async Task<ActionResult> Create(User user)
    {
        if(!ModelState.IsValid)
        {
            return BadRequest(new { Message = "Invalid user data." });
        }
        if(String.IsNullOrWhiteSpace(user.Username) ||
           String.IsNullOrWhiteSpace(user.Password))
        {
            return BadRequest(new { Message = "Username and password are required." });
        }
        var newUser = new IdentityUser
        {
            UserName = user.Username,
        };
        var createUser = await _userManager.CreateAsync(newUser, user.Password);
        if (createUser.Succeeded)
        {
            if (!await _roleManager.RoleExistsAsync("User"))
            {
                await _roleManager.CreateAsync(new IdentityRole("User"));
            }
            await _userManager.AddToRoleAsync(newUser, "User");   
            
            return Ok(new { Message = "User created successfully." });
        }

        return BadRequest(new { Message = "Failed to create user.", Errors = createUser.Errors });
    }



    [HttpPost("Login", Name = "LoginUser")]
    public async Task<ActionResult> Login([FromBody] User user)
    {
        if(!ModelState.IsValid)
        {
            return BadRequest(new { Message = "Invalid user data." });
        }
        if(String.IsNullOrWhiteSpace(user.Username) ||
           String.IsNullOrWhiteSpace(user.Password))
        {
            return BadRequest(new { Message = "Username and password are required." });
        }

        var searchUser = await _userManager.FindByNameAsync(user.Username);
        if(searchUser == null || !_userManager.CheckPasswordAsync(searchUser, user.Password).Result)
        {
            return Unauthorized(new { Message = "Invalid username or password." });
        }

        //Gen token
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, searchUser.UserName),
            new Claim(ClaimTypes.NameIdentifier, searchUser.Id)
        };

        var jwtSettings = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings["Key"]));

                var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                Convert.ToDouble(jwtSettings["DurationInMinutes"])),
            signingCredentials: new SigningCredentials(
                key, SecurityAlgorithms.HmacSha256)
        );

        //Gen token
        var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
        //set response header and cookies
        Response.Cookies.Append("jwtToken", jwtToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Browsers require Secure=true for SameSite=None, and allow Secure=true on localhost
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddMinutes(
                Convert.ToDouble(jwtSettings["DurationInMinutes"]))
        });
        return Ok(new { message = "Login successful" });
    }

    [HttpPost("Logout", Name = "LogoutUser")]
    public ActionResult Logout()
    {
        Response.Cookies.Append("jwtToken", "", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(-1)
        });
        return Ok(new { message = "Logout successful" });
    }

    [Authorize]
    [HttpGet("ApiKeys")]
    public ActionResult GetApiKeys()
    {
        var userId = _userManager.GetUserId(User);
        if(userId == null) return Unauthorized();
        var keys = _context.UserApiKeys.Where(k => k.UserId == userId).Select(k => new { k.Id, k.KeyName, k.KeyValue }).ToList();
        return Ok(keys);
    }

    public class ApiKeyDto
    {
        public string KeyName { get; set; }
    }

    [Authorize]
    [HttpPost("ApiKeys")]
    public async Task<ActionResult> AddApiKey([FromBody] ApiKeyDto model)
    {
        var userId = _userManager.GetUserId(User);
        if(userId == null) return Unauthorized();
        
        var generatedKey = "sk-as-" + Guid.NewGuid().ToString("N");

        var newKey = new UserApiKey
        {
            UserId = userId,
            KeyName = string.IsNullOrEmpty(model.KeyName) ? "Unnamed Key" : model.KeyName,
            KeyValue = generatedKey
        };
        _context.UserApiKeys.Add(newKey);
        await _context.SaveChangesAsync();
        return Ok(new { Message = "API key generated successfully.", Key = generatedKey });
    }

    [Authorize]
    [HttpDelete("ApiKeys/{id}")]
    public async Task<ActionResult> DeleteApiKey(int id)
    {
        var userId = _userManager.GetUserId(User);
        if(userId == null) return Unauthorized();
        
        var key = await _context.UserApiKeys.FindAsync(id);
        if(key == null || key.UserId != userId) return NotFound();
        
        _context.UserApiKeys.Remove(key);
        await _context.SaveChangesAsync();
        return Ok(new { Message = "API key deleted successfully." });
    }

    public class UserUpdateViewModel
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }

    [Authorize]
    [HttpPut("UpdateProfile")]
    public async Task<ActionResult> UpdateProfile([FromBody] UserUpdateViewModel model)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { Message = "User not found." });

        if (!string.IsNullOrWhiteSpace(model.Username))
        {
            var setUserNameResult = await _userManager.SetUserNameAsync(user, model.Username);
            if (!setUserNameResult.Succeeded)
            {
                return BadRequest(new { Message = "Failed to update username.", Errors = setUserNameResult.Errors });
            }
        }

        if (!string.IsNullOrWhiteSpace(model.Password))
        {
            var removePasswordResult = await _userManager.RemovePasswordAsync(user);
            if (!removePasswordResult.Succeeded)
            {
                return BadRequest(new { Message = "Failed to remove old password.", Errors = removePasswordResult.Errors });
            }

            var addPasswordResult = await _userManager.AddPasswordAsync(user, model.Password);
            if (!addPasswordResult.Succeeded)
            {
                return BadRequest(new { Message = "Failed to set new password.", Errors = addPasswordResult.Errors });
            }
        }

        return Ok(new { Message = "Profile updated successfully." });
    }
}