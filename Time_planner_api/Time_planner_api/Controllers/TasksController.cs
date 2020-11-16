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
                EndDate = task.EndDate == null ? null : task.EndDate?.ToLocalTime()
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

        // PUT: api/Tasks/weekplan
        [HttpPut]
        [Route("weekplan")]
        public async Task<ActionResult<IEnumerable<Models.TaskAssignmentProposition>>> GetWeekPlannedTasks(List<int> taskIds, double startMinutes = 420.0, double endMinutes = 1320.0)
        {
            var startOfWeek = DateTime.Today.AddDays(-1 * (int)(DateTime.Today.DayOfWeek) + 1); // starts from monday

            var events = new List<Event>[7];
            for (int i = 0; i < events.Length; i++)
            {
                var begin = startOfWeek.AddDays(i);
                var end = startOfWeek.AddDays(i + 1);
                events[i] = await _context.Events.Where(ev => ev.StartDate < end && ev.EndDate >= begin).ToListAsync();
                events[i].Sort((x, y) =>
                {
                    if (x.StartDate != y.StartDate)
                    {
                        return x.StartDate.CompareTo(y.StartDate);
                    }
                    return x.EndDate.CompareTo(y.EndDate);
                });
            }

            var windows = new List<(DateTime, DateTime)>[7];
            for (int i = 0; i < events.Length; i++)
            {
                var currentWindowStart = startOfWeek.AddDays(i).AddMinutes(startMinutes);
                windows[i] = new List<(DateTime, DateTime)>();
                var dayEnd = startOfWeek.AddDays(i).AddMinutes(endMinutes);
                foreach (var ev in events[i])
                {
                    if (currentWindowStart < ev.StartDate)
                    {
                        var currentWindowEnd = ev.EndDate;
                        if (dayEnd < currentWindowEnd)
                        {
                            currentWindowEnd = dayEnd;
                        }
                        windows[i].Add((currentWindowStart, currentWindowEnd));
                    }
                    if (ev.EndDate > currentWindowStart)
                    {
                        currentWindowStart = ev.EndDate;
                    }
                    if (ev.StartDate > dayEnd)
                    {
                        break;
                    }
                }
                if (currentWindowStart < dayEnd)
                {
                    windows[i].Add((currentWindowStart, dayEnd));
                }
            }

            var freeTimes = new List<double>[7];
            for (int i = 0; i < freeTimes.Length; i++)
            {
                freeTimes[i] = windows[i].Select(x => (x.Item2 - x.Item1).TotalMinutes).ToList();
            }

            var algorithmResult = WeekPlanHelper.FindBestWeekPlan(await _context.Tasks.Where(task => taskIds.Contains(task.Id)).ToListAsync(), freeTimes);

            var planningResult = new List<TaskAssignmentProposition>();
            foreach (var item in algorithmResult)
            {
                var dayTimes = new (DateTime, DateTime)[7];
                for (int i = 0; i < item.Item2.Length; i++)
                {
                    dayTimes[i] = item.Item2[i] >= 0 ? windows[i][item.Item2[i]] : (DateTime.MinValue, DateTime.MinValue);
                }
                planningResult.Add(new TaskAssignmentProposition()
                {
                    Task = item.Item1,
                    DayTimes = dayTimes.Select(dayTime => new TaskAssignmentProposition.Interval() { Start = dayTime.Item1, End = dayTime.Item2 }).ToArray()
                });
            }

            return planningResult;
        }

        // PUT: api/Tasks/weekplan
        [HttpPut]
        [Route("saveDates")]
        public async Task<ActionResult<IEnumerable<Models.TaskAssignmentSave>>> SaveDates(List<TaskAssignmentSave> tasksToSave)
        {
            foreach (var task in tasksToSave)
            {
                Models.Task newTask = _context.Tasks.Where(t => t.Id == task.TaskId).Single<Models.Task>();
                // todo marta
                //newTask.StartDate = task.StartDate != null ? task.StartDate?.ToLocalTime() : task.StartDate;
                //newTask.EndDate = task.EndDate != null ? task.EndDate?.ToLocalTime() : task.EndDate;

                _context.Entry(newTask).State = EntityState.Modified;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return NoContent();
        }

        private bool TaskExists(int id)
        {
            return _context.Tasks.Any(t => t.Id == id);
        }
     
    }
}
