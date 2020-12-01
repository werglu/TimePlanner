using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Time_planner_api.Models;

namespace Time_planner_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public UsersController(DatabaseContext context)
        {
            _context = context;
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
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost("{id}")]
        public async Task<IActionResult> PostUser([FromRoute]string id)
        {
            if (UserExists(id))
            {
                return NoContent();
            }

            try
            {
                _context.Users.Add(new User() { FacebookId = id });
                await _context.SaveChangesAsync();

                return Ok();
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

        private bool UserExists(string id)
        {
            return _context.Users.Any(e => e.FacebookId == id);
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
