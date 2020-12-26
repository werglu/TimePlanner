using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Time_planner_api.Helpers;
using Time_planner_api.Models;

namespace Time_planner_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : BaseController
    {
        private readonly DatabaseContext _context;

        public TasksController(DatabaseContext context)
        {
            _context = context;
        }

        // GET: api/Tasks
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasks()
        {
            var userId = GetUserId();
            var categories = await _context.ListCategories.Where(c => c.OwnerId == userId).Select(cc => cc.Id).ToListAsync();
            return await _context.Tasks.Where(t => categories.Contains(t.CategoryId)).ToListAsync();
        }


        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Models.Task>> GetTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            var category = _context.ListCategories.Where(c => c.Id == task.CategoryId).Single<Models.ListCategory>();

            if (GetUserId() != category.OwnerId)
            {
                return Unauthorized();
            }

            if (task == null)
            {
                return NotFound();
            }

            return task;
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult> PutTask([FromRoute]int id, Models.Task task)
        {
            Models.Task newTask = _context.Tasks.Where(t => t.Id == id).Single<Models.Task>();

            {
                var oldCategory = await _context.ListCategories.FirstOrDefaultAsync(c => c.Id == task.CategoryId);
                var newCategory = await _context.ListCategories.FirstOrDefaultAsync(c => c.Id == newTask.CategoryId);
                if (oldCategory == null || newCategory == null)
                {
                    return BadRequest();
                }
                var userId = GetUserId();
                if (userId != newCategory.OwnerId || userId != oldCategory.OwnerId)
                {
                    return Unauthorized();
                }
                _context.Entry(oldCategory).State = EntityState.Detached;
                _context.Entry(newCategory).State = EntityState.Detached;
            }

            newTask.Id = task.Id;
            newTask.IsDone = task.IsDone;
            newTask.Title = task.Title;
            newTask.CategoryId = task.CategoryId;
            newTask.Category = task.Category;
            newTask.Priority = task.Priority;
            newTask.Latitude = task.Latitude;
            newTask.Longitude = task.Longitude;
            newTask.Date0 = task.Date0 != null ? task.Date0?.ToLocalTime() : task.Date0;
            newTask.Date1 = task.Date1 != null ? task.Date1?.ToLocalTime() : task.Date1;
            newTask.Date2 = task.Date2 != null ? task.Date2?.ToLocalTime() : task.Date2;
            newTask.Date3 = task.Date3 != null ? task.Date3?.ToLocalTime() : task.Date3;
            newTask.Date4 = task.Date4 != null ? task.Date4?.ToLocalTime() : task.Date4;
            newTask.Date5 = task.Date5 != null ? task.Date5?.ToLocalTime() : task.Date5;
            newTask.Date6 = task.Date6 != null ? task.Date6?.ToLocalTime() : task.Date6;
            newTask.Days = task.Days;
            newTask.Time = task.Time;
            newTask.Split = task.Split;
            newTask.City = task.City == " " ? null : task.City;
            newTask.StreetAddress = task.StreetAddress == " " ? null : task.StreetAddress;

            _context.Entry(newTask).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
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


        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Models.Task>> PostTask(Models.Task task)
        {
            var category = _context.ListCategories.Where(c => c.Id == task.CategoryId).Single<Models.ListCategory>();
            if (GetUserId() != category.OwnerId)
            {
                return Unauthorized();
            }

            await _context.Tasks.AddAsync(new Models.Task()
            {
                Title = task.Title,
                IsDone = task.IsDone,
                CategoryId = task.CategoryId,
                Category = null,
                Priority = task.Priority,
                Latitude = task.Latitude,
                Longitude = task.Longitude,
                Date0 = task.Date0 == null ? null : task.Date0?.ToLocalTime(),
                Date1 = task.Date1 == null ? null : task.Date1?.ToLocalTime(),
                Date2 = task.Date2 == null ? null : task.Date2?.ToLocalTime(),
                Date3 = task.Date3 == null ? null : task.Date3?.ToLocalTime(),
                Date4 = task.Date4 == null ? null : task.Date4?.ToLocalTime(),
                Date5 = task.Date5 == null ? null : task.Date5?.ToLocalTime(),
                Date6 = task.Date6 == null ? null : task.Date6?.ToLocalTime(),
                Days = task.Days,
                Time = task.Time,
                Split = task.Split,
                City = task.City,
                StreetAddress = task.StreetAddress
            });

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (TaskExists(task.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetTask", new { id = task.Id }, task);
        }


        // DELETE: api/Tasks/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult<Models.Task>> DeleteTask([FromRoute] int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            if (GetUserId() != task.Category.OwnerId)
            {
                return Unauthorized();
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return task;
        }

        private bool TaskExists(int id)
        {
            return _context.Tasks.Any(t => t.Id == id);
        }
     
    }
}
