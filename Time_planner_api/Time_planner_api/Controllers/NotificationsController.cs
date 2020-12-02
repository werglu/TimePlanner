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

        // GET: api/Notifications/userId
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications(string userId)
        {
            return await _context.Notifications.Where(n => n.IsDismissed == false && n.ReceiverId == userId).ToListAsync();
        }

        [HttpGet("{userId}/{id}")]
        public async Task<ActionResult<Notification>> GetNotification(string userId, int id)
        {
            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null)
            {
                return NotFound();
            }

            return notification;
        }

        [HttpPost]
        [Route("add")]
        public async Task<ActionResult<Notification>> PostNotification(Notification ourNotification)
        {
            await _context.Notifications.AddAsync(new Notification()
            {
                IsDismissed = ourNotification.IsDismissed,
                MessageType = ourNotification.MessageType,
                SenderId = ourNotification.SenderId,
                ReceiverId = ourNotification.ReceiverId,
                EventId = ourNotification.EventId
            });

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (NotificationExists(ourNotification.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetNotification", new { userId = ourNotification.SenderId, id = ourNotification.Id }, ourNotification);
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
            newNotification.ReceiverId = notification.ReceiverId;
            newNotification.SenderId = notification.SenderId;

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


        // DELETE: api/Notifications/deleteAll
        [HttpDelete("deleteAll/{eventId}")]
        public async Task<ActionResult<IEnumerable<Notification>>> DeleteAllNotificationsWithSpecifiedEventId([FromRoute] int eventId)
        {
            var notifications = _context.Notifications.Where(n => n.EventId == eventId);
            if (notifications == null)
            {
                return NotFound();
            }

            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();

            return notifications.ToList();
        }

        private bool NotificationExists(int id)
        {
            return _context.Notifications.Any(n => n.Id == id);
        }

    }
}
