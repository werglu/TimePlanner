using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Time_planner_api.Externals;
using Time_planner_api.Models;

namespace Time_planner_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private const string TokenValidationUrl = "https://graph.facebook.com/debug_token?input_token={0}&access_token={1}|{2}";
        private readonly DatabaseContext _context;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;

        public UsersController(DatabaseContext context, IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _config = config;
            _httpClientFactory = httpClientFactory;
        }

        // GET: api/Users
        /// <summary>
        /// Get all users from database
        /// </summary>
        /// <returns>Collection of User objects</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET:  api/Users/103609784907565
        /// <summary>
        /// Get user of specified id
        /// </summary>
        /// <param name="id"></param>
        /// <returns>User</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser([FromRoute]string id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5
        /// <summary>
        /// Add user to databese if user not exists
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        [HttpPost("{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> PostUser([FromRoute]string token)
        {
            var validationResult = await Validate(token);
            if (validationResult == null || !validationResult.Data.IsValid)
            {
                return Unauthorized();
            }

            var id = validationResult.Data.UserId;

            if (!UserExists(id))
            {
                try
                {
                    _context.Users.Add(new User() { FacebookId = id });
                    await _context.SaveChangesAsync();
                }
                catch (Exception e)
                {
                    if (!UserExists(id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
            }

            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetValue<string>("AppSecret")));
            var signingCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

            var tokenOptions = new JwtSecurityToken(
                issuer: "https://localhost:44336",
                audience: "https://localhost:44332",
                claims: new List<Claim>()
                {
                    new Claim(JwtRegisteredClaimNames.Sub, id)
                },
                expires: DateTime.Now.AddDays(1), // todo: use validationResult.Data.ExpiresAt and add refresh token
                signingCredentials: signingCredentials);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
            return Ok(new { Token = tokenString });
        }

        private bool UserExists(string id)
        {
            return _context.Users.Any(e => e.FacebookId == id);
        }

        private async Task<FacebookTokenValidationResult> Validate(string token)
        {
            try
            {
                var url = string.Format(TokenValidationUrl, token, _config.GetValue<string>("FacebookAppId"), _config.GetValue<string>("FacebookAppSecret"));
                var result = await _httpClientFactory.CreateClient().GetAsync(url);
                result.EnsureSuccessStatusCode();
                var resultString = await result.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<FacebookTokenValidationResult>(resultString);
            }
            catch(Exception e)
            {
                return null;
            }
        }

        // DELETE: api/Users/10/62
        /// <summary>
        /// Delete user from database
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpDelete("{userId}")]
        public async Task<ActionResult<User>> DeleteUser([FromRoute] string userId)
        {
            if (!UserExists(userId))
            {
                return NoContent();
            }

            var user = await _context.Users.FindAsync(userId);
            try
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (UserExists(user.FacebookId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return user;
        }
    }
}
