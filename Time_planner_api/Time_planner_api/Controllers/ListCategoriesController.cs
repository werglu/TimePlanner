using System;
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
    public class ListCategoriesController : ControllerBase
    {

        private readonly DatabaseContext _context;

        public ListCategoriesController(DatabaseContext context)
        {
            _context = context;
        }

        // GET: api/ListCategories
        /// <summary>
        /// Get all categories 
        /// </summary>
        /// <returns>Collection of ListCategory objects</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ListCategory>>> GetCategories()
        {
            return await _context.ListCategories.ToListAsync();
        }

        // GET: api/ListCategories/perUser
        /// <summary>
        /// Get all categories per user
        /// </summary>
        /// <param name="userId"></param>
        /// <returns>Collection of ListCategory objects</returns>
        [HttpGet("perUser/{userId}")]
        public async Task<ActionResult<IEnumerable<ListCategory>>> GetCategoriesPerUser(string userId)
        {
            return await _context.ListCategories.Where(lc => lc.OwnerId == userId).ToListAsync();
        }

        // POST: api/ListCategories
        /// <summary>
        /// Post category
        /// </summary>
        /// <returns>Posted list category</returns>
        [HttpPost]
        public async Task<ActionResult<ListCategory>> PostCategory(ListCategory listCategory)
        {
            await _context.ListCategories.AddAsync(new ListCategory()
            {
                Category = listCategory.Category,
                OwnerId = listCategory.OwnerId
            });

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (CategoryExists(listCategory.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetCategory", new { id = listCategory.Id }, listCategory);
        }

        private bool CategoryExists(int id)
        {
            return _context.ListCategories.Any(e => e.Id == id);
        }
    }
}
