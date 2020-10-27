using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Time_planner_api.Helpers;
using Time_planner_api.Models;

namespace Time_planner_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {

        private readonly DatabaseContext _context;

        public EventsController(DatabaseContext context)
        {
            _context = context;
        }


        // GET: api/Events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            return await _context.Events.ToListAsync();
        }


        // GET: api/Events/2
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var ourEvent = await _context.Events.FindAsync(id);

            if (ourEvent == null)
            {
                return NotFound();
            }

            return ourEvent;
        }

        // POST: api/Events
        [HttpPost]
        public async Task<ActionResult<Event>> PostEvent(Event ourEvent)
        {
            await _context.Events.AddAsync( new Event() {
                StartDate = ourEvent.StartDate.ToLocalTime(),
                Title = ourEvent.Title, 
                EndDate= ourEvent.EndDate.ToLocalTime()
            }); 

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (EventExists(ourEvent.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetEvent", new { id = ourEvent.Id }, ourEvent);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> PutEvent([FromRoute]int id, Event oldEvent)
        {
            Event newEvent = _context.Events.Where(e => e.Id == id).Single<Event>();
            newEvent.Id = oldEvent.Id;
            newEvent.StartDate = oldEvent.StartDate.ToLocalTime();
            newEvent.Title = oldEvent.Title;
            newEvent.EndDate = oldEvent.EndDate.ToLocalTime();

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
        public async Task<ActionResult<Event>> DeleteEvent([FromRoute] int id)
        {
            var ourEvent = await _context.Events.FindAsync(id);
            if (ourEvent == null)
            {
                return NotFound();
            }

            _context.Events.Remove(ourEvent);
            await _context.SaveChangesAsync();

            return ourEvent;
        }

        // GET: api/Events/sort
        [HttpGet]
        [Route("sort")]
        public async Task<ActionResult<IEnumerable<Event>>> GetSortedEvents()
        {
            return SalesmanHelper.FindShortestRoute(await _context.Events.ToListAsync());
        }

        private bool EventExists(int id)
        {
            return _context.Events.Any(e => e.Id == id);
        }
      
    }
}


