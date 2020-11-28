using System;
using System.Collections.Generic;
using System.Globalization;
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
    public class TasksController : ControllerBase
    {
        private readonly DatabaseContext _context;

        public TasksController(DatabaseContext context)
        {
            _context = context;
        }

        // GET: api/Tasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Models.Task>>> GetTasks()
        {
            return await _context.Tasks.ToListAsync();
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<Models.Task>> GetTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
            {
                return NotFound();
            }

            return task;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> PutTask([FromRoute]int id, Models.Task task)
        {
            Models.Task newTask = _context.Tasks.Where(t => t.Id == id).Single<Models.Task>();
            newTask.Id = task.Id;
            newTask.IsDone = task.IsDone;
            newTask.Title = task.Title;
            newTask.CategoryId = task.CategoryId;
            newTask.Category = task.Category;
            newTask.Priority = task.Priority;
            newTask.StartDate = task.StartDate != null ? task.StartDate?.ToLocalTime() : task.StartDate;
            newTask.EndDate = task.EndDate != null ? task.EndDate?.ToLocalTime() : task.EndDate;
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
        public async Task<ActionResult<Models.Task>> PostTask(Models.Task task)
        {
            await _context.Tasks.AddAsync(new Models.Task()
            {
                Title = task.Title,
                IsDone = task.IsDone,
                CategoryId = task.CategoryId,
                Category = null,
                Priority = task.Priority,
                StartDate = task.StartDate == null ? null : task.StartDate?.ToLocalTime(),
                EndDate = task.EndDate == null ? null : task.EndDate?.ToLocalTime(),
                Date0 = task.Date0 == null ? null : task.Date0?.ToLocalTime(),
                Date1 = task.Date1 == null ? null : task.Date1?.ToLocalTime(),
                Date2 = task.Date2 == null ? null : task.Date2?.ToLocalTime(),
                Date3 = task.Date3 == null ? null : task.Date3?.ToLocalTime(),
                Date4 = task.Date4 == null ? null : task.Date4?.ToLocalTime(),
                Date5 = task.Date5 == null ? null : task.Date5?.ToLocalTime(),
                Date6 = task.Date6 == null ? null : task.Date6?.ToLocalTime(),
                Days = task.Days,
                Time = task.Time,
                Split = task.Split
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
        public async Task<ActionResult<Models.Task>> DeleteTask([FromRoute] int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
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
