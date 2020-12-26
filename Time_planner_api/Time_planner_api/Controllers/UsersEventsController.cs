using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Time_planner_api.Models;

namespace Time_planner_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersEventsController : BaseController
    {

        private readonly DatabaseContext _context;

        public UsersEventsController(DatabaseContext context)
        {
            _context = context;
        }

        // GET: api/UsersEvents/userId/eventId
        [HttpGet("{userId}/{eventId}")]
        [Authorize]
        public async Task<ActionResult<UsersEvents>> GetUserEvent(string userId, int eventId)
        {
            var result = await _context.UsersEvents.FirstOrDefaultAsync(ue => ue.EventId == eventId && userId == ue.UserId);
            if (result == null)
            {
                return new UsersEvents() {
                    Id = -1
                };
            }
            else
            {
                var allUsers = await _context.UsersEvents.Where(ue => ue.EventId == eventId).Select(uee => uee.UserId).ToListAsync();
                var askingUserId = GetUserId();
                if (!allUsers.Contains(askingUserId))
                {
                    return Unauthorized();
                }
                return result;
            }
        }

        private bool UserEventExists(int id)
        {
            return _context.UsersEvents.Any(e => e.Id == id);
        }
    }
}
