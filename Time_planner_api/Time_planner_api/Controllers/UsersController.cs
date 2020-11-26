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
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET:  api/Users/103609784907565/62
        [HttpGet("{userId}/{eventId}")]
        public async Task<ActionResult<int>> GetIfUserAttendsInEvent([FromRoute]string userId, [FromRoute]string eventId)
        {
            if (!UserExists(userId))
                return -1;

            var user = await _context.Users.FindAsync(userId);
            var eventItem = await _context.Events.FindAsync(eventId);

            if (user.AttendedEvents.Contains(eventItem))
                return 1;

            return 0;            
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUsers([FromRoute]string id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
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
            catch (Exception e) //(DbUpdateConcurrencyException)
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

        [HttpPost("{id}/{eventId}")]
        public async Task<IActionResult> AddAttendingEvent([FromRoute]string id, [FromRoute]int eventId)
        {
            if (!UserExists(id))
            {
                return NoContent();
            }

            var user = await _context.Users.FindAsync(id);
            var eventItem = await _context.Events.FindAsync(eventId);
            user.AttendedEvents.Add(eventItem);

            try
            {
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

            return Ok();
        }

        private bool UserExists(string id)
        {
            return _context.Users.Any(e => e.FacebookId == id);
        }

        // DELETE: api/Users/103609784907565/62
        [HttpDelete("{userId}/{eventId}")]
        public async Task<ActionResult<User>> DeleteEvent([FromRoute] string userId, [FromRoute] int eventId)
        {
            if (!UserExists(userId))
            {
                return NoContent();
            }

            var user = await _context.Users.FindAsync(userId);
            var eventItem = await _context.Events.FindAsync(eventId);
            if (user.AttendedEvents.Contains(eventItem))
            {
                user.AttendedEvents.Remove(eventItem);
                await _context.SaveChangesAsync();
                return user;
            }

            return NoContent();
        }
    }
}
