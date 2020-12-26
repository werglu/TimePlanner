using Microsoft.AspNetCore.Authorization;
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
    public class NotificationsController : BaseController
    {
        private readonly DatabaseContext _context;

        public NotificationsController(DatabaseContext context)
        {
            _context = context;
        }

        // GET: api/Notifications/userId
        /// <summary>
        /// Get all notifications per user
        /// </summary>
        /// <param name="userId"></param>
        /// <returns>Collection of Notification objects</returns>
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
        {
            var userId = GetUserId();
            return await _context.Notifications.Where(n => n.IsDismissed == false && n.ReceiverId == userId).ToListAsync();
        }

        // POST: api/Notifications/dismiss?id=a
        /// <summary>
        /// Dismiss notification with specified id
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("dismiss")]
        [Authorize]
        public async Task<ActionResult> DismissNotification(int id)
        {
            Notification newNotification = _context.Notifications.Where(n => n.Id == id).Single<Notification>();

            if (GetUserId() != newNotification.ReceiverId)
            {
                return Unauthorized();
            }

            newNotification.IsDismissed = true;

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

        // POST: api/Notifications/accept?id=a
        /// <summary>
        /// Accept notification with specified id
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("accept")]
        [Authorize]
        public async Task<ActionResult> AcceptNotification(int id)
        {
            Notification notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id);

            if (notification == null || notification.MessageType != 0) // invited
            {
                return BadRequest();
            }

            if (GetUserId() != notification.ReceiverId)
            {
                return Unauthorized();
            }

            await _context.Notifications.AddAsync(new Notification()
            {
                IsDismissed = false,
                MessageType = 1, // accepted
                SenderId = notification.ReceiverId,
                ReceiverId = notification.SenderId,
                EventId = notification.EventId
            });

            UsersEvents usersEvents = await _context.UsersEvents.FirstOrDefaultAsync(ue => ue.EventId == notification.EventId && ue.UserId == notification.ReceiverId);
            if (usersEvents != null)
            {
                usersEvents.Status = 1; // accepted
                _context.Entry(usersEvents).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/Notifications/reject?id=a
        /// <summary>
        /// Reject notification with specified id
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("reject")]
        [Authorize]
        public async Task<ActionResult> RejectNotification(int id)
        {
            Notification notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id);

            if (notification == null || notification.MessageType != 0) // invited
            {
                return BadRequest();
            }

            if (GetUserId() != notification.ReceiverId)
            {
                return Unauthorized();
            }

            // add accepted notification
            await _context.Notifications.AddAsync(new Notification()
            {
                IsDismissed = false,
                MessageType = 2, // rejected
                SenderId = notification.ReceiverId,
                ReceiverId = notification.SenderId,
                EventId = notification.EventId
            });

            // update usersEvets state
            UsersEvents usersEvents = await _context.UsersEvents.FirstOrDefaultAsync(ue => ue.EventId == notification.EventId && ue.UserId == notification.ReceiverId);
            if (usersEvents != null)
            {
                usersEvents.Status = 2; //rejected
                _context.Entry(usersEvents).State = EntityState.Modified;
            }

            // create new event, todo: don't
            Event ev = await _context.Events.FirstOrDefaultAsync(e => e.Id == notification.EventId);
            if (ev != null)
            {
                await _context.Events.AddAsync(new Event()
                {
                    StartDate = ev.StartDate,
                    Title = ev.Title,
                    EndDate = ev.EndDate,
                    City = ev.City,
                    StreetAddress = ev.StreetAddress,
                    IsPublic = ev.IsPublic,
                    OwnerId = notification.ReceiverId,
                    Description = ev.Description,
                    Longitude = ev.Longitude,
                    Latitude = ev.Latitude
                });
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/Notifications/invite?eventId=a&receiverId=b
        /// <summary>
        /// Send invite notification with specified id
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("invite")]
        [Authorize]
        public async Task<ActionResult> SendInviteNotification(int eventId, string receiverId)
        {
            Event ev = await _context.Events.FirstOrDefaultAsync(e => e.Id == eventId);
            if (ev == null)
            {
                return BadRequest();
            }

            var userId = GetUserId();
            if (userId != ev.OwnerId)
            {
                return Unauthorized();
            }

            await _context.Notifications.AddAsync(new Notification()
            {
                IsDismissed = false,
                MessageType = 0, // invited
                SenderId = userId,
                ReceiverId = receiverId,
                EventId = eventId
            });
            
            await _context.UsersEvents.AddAsync(new UsersEvents()
            {
                EventId = eventId,
                UserId = receiverId,
                Status = 0 // unknown
            });

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool NotificationExists(int id)
        {
            return _context.Notifications.Any(n => n.Id == id);
        }
    }
}
