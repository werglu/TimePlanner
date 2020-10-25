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
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ListCategory>>> GetCategories()
        {
            return await _context.ListCategories.ToListAsync();
        }

        // GET: api/ListCategories/5
        [HttpGet("{id}", Name = "Get")]
        public string GetCategory(int id)
        {
            return "value";
        }

        // POST: api/ListCategories
        [HttpPost]
        public async Task<ActionResult<ListCategory>> PostEvent(ListCategory listCategory)
        {
            await _context.ListCategories.AddAsync(new ListCategory()
            {
                Category = listCategory.Category
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
        // PUT: api/ListCategories/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        private bool CategoryExists(int id)
        {
            return _context.ListCategories.Any(e => e.Id == id);
        }
    }
}
