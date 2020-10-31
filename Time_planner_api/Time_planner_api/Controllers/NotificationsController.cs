using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Time_planner_api.Models;

namespace Time_planner_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public NotificationsController(DatabaseContext context)
        {
            _context = context;
        }

        // GET: api/Notifications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
        {
            return await _context.Notifications.Where(n => n.IsDismissed == false).ToListAsync();
        }


        [HttpPut("{id}")]
        public async Task<ActionResult> PutNotification([FromRoute]int id, Notification notification)
        {
            Notification newNotification = _context.Notifications.Where(n => n.Id == id).Single<Notification>();
            newNotification.IsDismissed = notification.IsDismissed;
            newNotification.MessageType = notification.MessageType;
            newNotification.EventId = notification.EventId;
            newNotification.Event = notification.Event;
            newNotification.Id = notification.Id;

            _context.Entry(newNotification).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NotificationExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        private bool NotificationExists(int id)
        {
            return _context.Notifications.Any(n => n.Id == id);
        }

    }
}
