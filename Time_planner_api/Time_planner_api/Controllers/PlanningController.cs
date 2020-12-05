﻿using System;
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
    public class PlanningController : ControllerBase
    {

        private readonly DatabaseContext _context;

        public PlanningController(DatabaseContext context)
        {
            _context = context;
        }

        // PUT: api/Planning/weekplan
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
                        var currentWindowEnd = ev.StartDate;
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

        // PUT: api/Planning/saveDates
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

        private DateTime GetDate(int day)
        {
            return DateTime.Today.AddDays(-1 * (int)(DateTime.Today.DayOfWeek) + 1).AddDays(day % 7); // starts from monday
        }

        // GET: api/Planning/dayplan/104416411457610
        [HttpGet("{userId}")]
        [Route("dayplan/{userId}")]
        public async Task<ActionResult<IEnumerable<CalendarItem>>> FindShortestRoute(string userId, double startMinutes = 420.0, double endMinutes = 1320.0)
        {
            var events = await _context.Events.Where(x => x.OwnerId == userId).ToListAsync();
            var tasks = await _context.Tasks.Where(y => y.Category.OwnerId == userId).ToListAsync();
            events = events.Where(x => IsCurrentDay(x)).ToList();
            tasks = tasks.Where(y => IsCurrentDay(y)).ToList();
            return DayPlanHelper.FindShortestRoute(events, tasks, startMinutes, endMinutes);
        }

        private bool IsCurrentDay(Event ev)
        {
            return ev.StartDate < DateTime.Today.AddDays(1) && ev.EndDate >= DateTime.Today;
        }

        private bool IsCurrentDay(Models.Task task)
        {
            var days = new List<DateTime?>()
            {
                task.Date0, task.Date1, task.Date2, task.Date3, task.Date4, task.Date5, task.Date6
            };
            foreach (var day in days)
            {
                if (day.HasValue && day.Value >= DateTime.Today && day.Value < DateTime.Today.AddDays(1))
                {
                    return true;
                }
            }
            return false;
        }

        private bool TaskExists(int id)
        {
            return _context.Tasks.Any(t => t.Id == id);
        }

    }
}

