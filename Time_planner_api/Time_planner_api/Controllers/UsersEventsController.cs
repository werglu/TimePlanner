﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Time_planner_api.Models;

namespace Time_planner_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersEventsController : ControllerBase
    {

        private readonly DatabaseContext _context;

        public UsersEventsController(DatabaseContext context)
        {
            _context = context;
        }

        // GET: api/UsersEvents
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsersEvents>>> GetUserEvents()
        {
            return await _context.UsersEvents.ToListAsync();
        }

        // GET: api/UsersEvents/userId/eventId
        [HttpGet("{userId}/{eventId}")]
        public async Task<ActionResult<UsersEvents>> GetUserEvent(string userId, int eventId)
        {
            var userEvent = await _context.UsersEvents.FirstAsync(ue => ue.EventId == eventId && userId == ue.UserId);

            if (userEvent == null)
            {
                return NotFound();
            }

            return userEvent;
        }

        // POST: api/UsersEvents
        [HttpPost]
        public async Task<ActionResult<UsersEvents>> PostUserEvent(UsersEvents userEvent)
        {
            await _context.UsersEvents.AddAsync(new UsersEvents()
            {
                EventId = userEvent.EventId,
                UserId = userEvent.UserId,
                Status = userEvent.Status            
            });

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (UserEventExists(userEvent.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetUserEvent", new { userId = userEvent.UserId, eventId = userEvent.EventId }, userEvent);
        }

        // PUT: api/UsersEvents/5
        [HttpPut("{id}")]
        public async Task<ActionResult> PutUserEvent([FromRoute]int id, UsersEvents oldEvent)
        {
            UsersEvents newEvent = _context.UsersEvents.Where(ue => ue.Id == oldEvent.Id).Single();
            newEvent.EventId = oldEvent.EventId;
            newEvent.UserId = oldEvent.UserId;
            newEvent.Status = oldEvent.Status;

            _context.Entry(newEvent).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserEventExists(id))
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

        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        private bool UserEventExists(int id)
        {
            return _context.UsersEvents.Any(e => e.Id == id);
        }
    }
}