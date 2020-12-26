using System;
using System.Collections.Generic;
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
    public class EventsController : BaseController
    {
        private readonly DatabaseContext _context;

        public EventsController(DatabaseContext context)
        {
            _context = context;
        }

        // GET: api/Events/user?id=a
        [HttpGet]
        [Authorize]
        [Route("user")]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents(string id)
        {
            var allEvents = await _context.Events.Where(e => e.OwnerId == id).ToListAsync();
            if (GetUserId() == id)
            {
                return allEvents;
            }

            var filteredEvents = new List<Event>();
            foreach(var ev in allEvents)
            {
                if (ev.IsPublic)
                {
                    filteredEvents.Add(new Event()
                    {
                        Id = ev.Id,
                        Title = ev.Title,
                        StartDate = ev.StartDate,
                        EndDate = ev.EndDate
                    });
                }
                else
                {
                    filteredEvents.Add(new Event()
                    {
                        Id = ev.Id,
                        Title = "",
                        StartDate = ev.StartDate,
                        EndDate = ev.EndDate
                    });
                }
            }

            return filteredEvents;
        }

        // GET: api/Events/event?id=a
        [HttpGet]
        [Authorize]
        [Route("event")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var ourEvent = await _context.Events.FindAsync(id);
            var userId = GetUserId();

            if (ourEvent == null)
            {
                return NotFound();
            }

            if (ourEvent.IsPublic || userId == ourEvent.OwnerId)
            {
                return ourEvent;
            }
            else
            {
                var invitedFriends = await _context.UsersEvents.Where(e => e.EventId == id && e.Status != 2 /* not rejected */).Select(ee => ee.UserId).ToListAsync();
                if (invitedFriends.Contains(userId))
                {
                    return new Event()
                    {
                        Id = ourEvent.Id,
                        Title = ourEvent.Title,
                        StartDate = ourEvent.StartDate,
                        EndDate = ourEvent.EndDate,
                        Latitude = ourEvent.Latitude,
                        Longitude = ourEvent.Longitude
                    };
                }
                return new Event()
                {
                    Id = ourEvent.Id,
                    Title = "",
                    StartDate = ourEvent.StartDate,
                    EndDate = ourEvent.EndDate,
                    Latitude = ourEvent.Latitude,
                    Longitude = ourEvent.Longitude
                };
            }
        }

        // POST: api/Events
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Event>> PostEvent(EventWithFriends ourEvent)
        {
            if (ourEvent.Event.OwnerId != GetUserId())
            {
                return Unauthorized();
            }

            var newEvent = new Event()
            {
                StartDate = ourEvent.Event.StartDate.ToLocalTime(),
                Title = ourEvent.Event.Title,
                EndDate = ourEvent.Event.EndDate.ToLocalTime(),
                City = ourEvent.Event.City,
                StreetAddress = ourEvent.Event.StreetAddress,
                IsPublic = ourEvent.Event.IsPublic,
                OwnerId = ourEvent.Event.OwnerId,
                Description = ourEvent.Event.Description,
                Longitude = ourEvent.Event.Longitude,
                Latitude = ourEvent.Event.Latitude
            };

            await _context.Events.AddAsync(newEvent); 

            try
            {
                // save event
                await _context.SaveChangesAsync();
                var eventId = newEvent.Id;
                // add usersEvents for owner
                await _context.UsersEvents.AddAsync(new UsersEvents()
                {
                    EventId = eventId,
                    UserId = ourEvent.Event.OwnerId,
                    Status = 3 // owner
                });
                if (ourEvent.FriendIds != null)
                {
                    foreach (var friendId in ourEvent.FriendIds)
                    {
                        // add usersEvents for friends
                        await _context.UsersEvents.AddAsync(new UsersEvents()
                        {
                            EventId = eventId,
                            UserId = friendId,
                            Status = 0 // unknown
                        });
                        // add notifications for friends
                        await _context.Notifications.AddAsync(new Notification()
                        {
                            IsDismissed = false,
                            MessageType = 0, // invited
                            SenderId = ourEvent.Event.OwnerId,
                            ReceiverId = friendId,
                            EventId = eventId
                        });
                    }
                }
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (EventExists(ourEvent.Event.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetEvent", new {userId = ourEvent.Event.OwnerId, id = ourEvent.Event.Id }, ourEvent);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult> PutEvent([FromRoute]int id, Event oldEvent)
        {
            Event newEvent = _context.Events.Where(e => e.Id == id).Single<Event>();

            if (GetUserId() != oldEvent.OwnerId || oldEvent.OwnerId != newEvent.OwnerId)
            {
                return Unauthorized();
            }

            newEvent.Id = oldEvent.Id;
            newEvent.StartDate = oldEvent.StartDate.ToLocalTime();
            newEvent.Title = oldEvent.Title;
            newEvent.EndDate = oldEvent.EndDate.ToLocalTime();
            newEvent.City = oldEvent.City;
            newEvent.StreetAddress = oldEvent.StreetAddress;
            newEvent.IsPublic = oldEvent.IsPublic;
            newEvent.OwnerId = oldEvent.OwnerId;
            newEvent.Description = oldEvent.Description;
            newEvent.Latitude = oldEvent.Latitude;
            newEvent.Longitude = oldEvent.Longitude;

            _context.Entry(newEvent).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventExists(id))
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

        // DELETE: api/Events/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult<Event>> DeleteEvent([FromRoute] int id)
        {
            var ourEvent = await _context.Events.FindAsync(id);
            if (ourEvent == null)
            {
                return NotFound();
            }

            if (GetUserId() != ourEvent.OwnerId)
            {
                return Unauthorized();
            }

            _context.Events.Remove(ourEvent);
            var notifications = _context.Notifications.Where(n => n.EventId == id);
            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();

            return ourEvent;
        }

        private bool EventExists(int id)
        {
            return _context.Events.Any(e => e.Id == id);
        }
      
    }
}
