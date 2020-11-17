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

        // PUT: api/Tasks/weekplan
        [HttpPut]
        [Route("weekplan")]
        public async Task<ActionResult<IEnumerable<Models.TaskAssignmentProposition>>> GetWeekPlannedTasks(List<int> taskIds, double startMinutes = 420.0, double endMinutes = 1320.0)
        {
            var events = new List<Event>[7];
            for (int i = 0; i < events.Length; i++)
            {
                var begin = GetDate(i);
                var end = GetDate(i + 1);
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
                var currentWindowStart = GetDate(i).AddMinutes(startMinutes);
                windows[i] = new List<(DateTime, DateTime)>();
                var dayEnd = GetDate(i).AddMinutes(endMinutes);
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

            var freeTimes = new List<int>[7];
            for (int i = 0; i < freeTimes.Length; i++)
            {
                freeTimes[i] = windows[i].Select(x => (int)((x.Item2 - x.Item1).TotalMinutes)).ToList();
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

        // PUT: api/Tasks/saveDates
        [HttpPut]
        [Route("saveDates")]
        public async Task<ActionResult<IEnumerable<Models.TaskAssignmentSave>>> SaveDates(List<TaskAssignmentSave> tasksToSave)
        {
            foreach (var task in tasksToSave)
            {
                if (!TaskExists(task.TaskId))
                {
                    return NotFound();
                }

                Models.Task newTask = _context.Tasks.Where(t => t.Id == task.TaskId).Single<Models.Task>();

                newTask.Date0 = task.DayTimes[0] ? GetDate(0) : DateTime.MinValue;
                newTask.Date1 = task.DayTimes[1] ? GetDate(1) : DateTime.MinValue;
                newTask.Date2 = task.DayTimes[2] ? GetDate(2) : DateTime.MinValue;
                newTask.Date3 = task.DayTimes[3] ? GetDate(3) : DateTime.MinValue;
                newTask.Date4 = task.DayTimes[4] ? GetDate(4) : DateTime.MinValue;
                newTask.Date5 = task.DayTimes[5] ? GetDate(5) : DateTime.MinValue;
                newTask.Date6 = task.DayTimes[6] ? GetDate(6) : DateTime.MinValue;


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

        private DateTime GetDate(int day)
        {
            return DateTime.Today.AddDays(-1 * (int)(DateTime.Today.DayOfWeek) + 1).AddDays(day % 7); // starts from monday
        }
     
    }
}
