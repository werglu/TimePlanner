using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Time_planner_api.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Time_planner_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlacesController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public PlacesController(DatabaseContext context)
        {
            _context = context;
        }

        // GET api/Places/5
        /// <summary>
        /// Return all defined places by specific user
        /// </summary>
        /// <param name="userId">user's id</param>
        /// <returns>list of places</returns>
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<Place>>> Get(string userId)
        {
            if (!UserExists(userId))
                return NotFound();

            return await _context.Places.Where(e => e.OwnerId == userId).ToListAsync(); ;
        }

        // POST api/Places
        /// <summary>
        /// Adds a defined place
        /// </summary>
        /// <param name="place"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult> PostPlace(Place place)
        {
            if (!UserExists(place.OwnerId))
                return NotFound();

            await _context.Places.AddAsync(new Place()
            {
                Name = place.Name,
                City = place.City,
                StreetAddress = place.StreetAddress,
                OwnerId = place.OwnerId
            });

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (PlaceExists(place.Name))
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

        private bool PlaceExists(string name)
        {
            return _context.Places.Any(e => e.Name == name);
        }

        // PUT api/Place/5
        /// <summary>
        /// Edit place
        /// </summary>
        /// <param name="id">Place id</param>
        /// <param name="newPlace">New object of place</param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<ActionResult> PutPlace([FromRoute]int id, Place newPlace)
        {
            Place place = _context.Places.Where(p => p.Id == id).Single<Place>();

            place.Name = newPlace.Name;
            place.City = newPlace.City;
            place.StreetAddress = newPlace.StreetAddress;
            place.OwnerId = newPlace.OwnerId;

            _context.Entry(place).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PlaceExists(newPlace.Name))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok();
        }


        // DELETE: api/Events/5
        /// <summary>
        /// Delete defined place
        /// </summary>
        /// <param name="id">Place id</param>
        /// <returns>Deleted place</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<Place>> DeletePlace([FromRoute] int id)
        {
            var place = await _context.Places.FindAsync(id);
            if (place == null)
            {
                return NotFound();
            }

            _context.Places.Remove(place);
            await _context.SaveChangesAsync();

            return place;
        }
    }
}
