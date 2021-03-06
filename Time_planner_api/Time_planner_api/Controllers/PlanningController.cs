﻿using System;
using System.Collections.Generic;
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
    public class PlanningController : BaseController
    {

        private readonly DatabaseContext _context;

        public PlanningController(DatabaseContext context)
        {
            _context = context;
        }

        // PUT: api/Planning/weekplan?currentWeek=a&year=b&month=c&day=d
        [HttpPut]
        [Route("weekplan")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Models.TaskAssignmentProposition>>> GetWeekPlannedTasks(List<int> taskIds, bool currentWeek, int year, int month, int day, double startMinutes = 420.0, double endMinutes = 1320.0)
        {
            var userId = GetUserId();
            var categoryIds = await _context.Tasks.Where(task => taskIds.Contains(task.Id)).Select(t => t.CategoryId).ToListAsync();
            var categories = await _context.ListCategories.Where(c => categoryIds.Contains(c.Id)).ToListAsync();
            if (categories.Any(c => c.OwnerId != userId))
            {
                return Unauthorized();
            }
            var date = new DateTime(year, month, day);
            var events = new List<Event>[7];
            for (int i = 0; i < events.Length; i++)
            {
                var begin = GetDate(i, date, currentWeek);
                if (currentWeek && begin <= date)
                {
                    continue;
                }
                var end = GetDate(i + 1, date, currentWeek);
                events[i] = await FindEventsForUser(userId);
                events[i] = events[i].Where(ev => ev.StartDate < end && ev.EndDate >= begin).ToList();
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
                var currentWindowStart = GetDate(i, date, currentWeek).AddMinutes(startMinutes);
                windows[i] = new List<(DateTime, DateTime)>();
                var dayEnd = GetDate(i, date, currentWeek).AddMinutes(endMinutes);
                if (events[i] == null)
                {
                    continue;
                }
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

        // PUT: api/Planning/saveDates?currentWeek=a&year=b&month=c&day=d
        [HttpPut]
        [Route("saveDates")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Models.TaskAssignmentSave>>> SaveDates(List<TaskAssignmentSave> tasksToSave, bool currentWeek, int year, int month, int day)
        {
            if (tasksToSave == null)
            {
                return NoContent();
            }

            var userId = GetUserId();
            var taskIds = tasksToSave.Select(t => t.TaskId);         
            var categoryIds = await _context.Tasks.Where(task => taskIds.Contains(task.Id)).Select(t => t.CategoryId).ToListAsync();
            var categories = await _context.ListCategories.Where(c => categoryIds.Contains(c.Id)).ToListAsync();
            if (categories.Any(c => c.OwnerId != userId))
            {
                return Unauthorized();
            }

            var date = new DateTime(year, month, day);

            foreach (var task in tasksToSave)
            {
                if (!TaskExists(task.TaskId))
                {
                    return NotFound();
                }

                Models.Task newTask = _context.Tasks.Where(t => t.Id == task.TaskId).Single<Models.Task>();

                newTask.Date0 = task.DayTimes[0] ? GetDate(0, date, currentWeek) : DateTime.MinValue;
                newTask.Date1 = task.DayTimes[1] ? GetDate(1, date, currentWeek) : DateTime.MinValue;
                newTask.Date2 = task.DayTimes[2] ? GetDate(2, date, currentWeek) : DateTime.MinValue;
                newTask.Date3 = task.DayTimes[3] ? GetDate(3, date, currentWeek) : DateTime.MinValue;
                newTask.Date4 = task.DayTimes[4] ? GetDate(4, date, currentWeek) : DateTime.MinValue;
                newTask.Date5 = task.DayTimes[5] ? GetDate(5, date, currentWeek) : DateTime.MinValue;
                newTask.Date6 = task.DayTimes[6] ? GetDate(6, date, currentWeek) : DateTime.MinValue;


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

        // GET: api/Planning/dayplan?year=a&month=b&day=c
        [HttpGet]
        [Route("dayplan")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<CalendarItem>>> GetDayPlannedTasks(int year, int month, int day, double startMinutes = 420.0, double endMinutes = 1320.0)
        {
            var userId = GetUserId();
            var events = await FindEventsForUser(userId);
            var tasks = await _context.Tasks.Where(y => y.Category.OwnerId == userId).ToListAsync();
            var date = new DateTime(year, month, day);
            events = events.Where(x => IsDay(x, date)).ToList();
            tasks = tasks.Where(y => IsDay(y, date)).ToList();
            return DayPlanHelper.FindShortestRoute(events, tasks, date, startMinutes, endMinutes);
        }

        // GET: api/Planning/tasksForToday
        [HttpGet]
        [Route("tasksForToday")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Models.Task>>> FindTasksForToday()
        {
            var userId = GetUserId();
            return await _context.Tasks.Where(y => y.Category.OwnerId == userId && !y.IsDone &&
                                              (!y.Date0.HasValue || y.Date0.Value.Year <= 1970 ||
                                               !y.Date1.HasValue || y.Date1.Value.Year <= 1970 ||
                                               !y.Date2.HasValue || y.Date2.Value.Year <= 1970 ||
                                               !y.Date3.HasValue || y.Date3.Value.Year <= 1970 ||
                                               !y.Date4.HasValue || y.Date4.Value.Year <= 1970 ||
                                               !y.Date5.HasValue || y.Date5.Value.Year <= 1970 ||
                                               !y.Date6.HasValue || y.Date6.Value.Year <= 1970)).OrderBy(x => x.Priority).ToListAsync();
        }

        // PUT: api/Planning/tasksForToday?year=b&month=c&day=d
        [HttpPut]
        [Route("tasksForToday")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<int>>> SaveTasksForToday(List<int> taskIds, int year, int month, int day)
        {
            if (taskIds == null)
            {
                return NoContent();
            }

            var userId = GetUserId();
            var categoryIds = await _context.Tasks.Where(task => taskIds.Contains(task.Id)).Select(t => t.CategoryId).ToListAsync();
            var categories = await _context.ListCategories.Where(c => categoryIds.Contains(c.Id)).ToListAsync();
            if (categories.Any(c => c.OwnerId != userId))
            {
                return Unauthorized();
            }

            var date = new DateTime(year, month, day);

            foreach (var id in taskIds)
            {
                Models.Task newTask = _context.Tasks.Where(t => t.Id == id).Single<Models.Task>();

                if (!newTask.Date0.HasValue || newTask.Date0.Value.Year <= 1970)
                {
                    newTask.Date0 = date;
                    _context.Entry(newTask).State = EntityState.Modified;
                }
                else if (!newTask.Date1.HasValue || newTask.Date1.Value.Year <= 1970)
                {
                    newTask.Date1 = date;
                    _context.Entry(newTask).State = EntityState.Modified;
                }
                else if (!newTask.Date2.HasValue || newTask.Date2.Value.Year <= 1970)
                {
                    newTask.Date2 = date;
                    _context.Entry(newTask).State = EntityState.Modified;
                }
                else if (!newTask.Date3.HasValue || newTask.Date3.Value.Year <= 1970)
                {
                    newTask.Date3 = date;
                    _context.Entry(newTask).State = EntityState.Modified;
                }
                else if (!newTask.Date4.HasValue || newTask.Date4.Value.Year <= 1970)
                {
                    newTask.Date4 = date;
                    _context.Entry(newTask).State = EntityState.Modified;
                }
                else if (!newTask.Date5.HasValue || newTask.Date5.Value.Year <= 1970)
                {
                    newTask.Date5 = date;
                    _context.Entry(newTask).State = EntityState.Modified;
                }
                else if (!newTask.Date6.HasValue || newTask.Date6.Value.Year <= 1970)
                {
                    newTask.Date6 = date;
                    _context.Entry(newTask).State = EntityState.Modified;
                }
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

        // PUT: api/Planning/commonDate?userIds=a&start=b&end=c
        [HttpPut]
        [Route("commonDate")]
        [Authorize]
        public async Task<ActionResult<CommonDateOutput>> FindCommonDate(CommonDateInput input, double startMinutes = 420.0, double endMinutes = 1320.0)
        {
            var events = new List<Event>[input.UserIds.Length];
            var conflictingUsers = new List<string>();
            var start = input.Start.ToLocalTime();
            var end = input.End.ToLocalTime();

            for (int i = 0; i < input.UserIds.Length; i++)
            {
                events[i] = await FindEventsForUser(input.UserIds[i]);
                events[i].RemoveAll(ev => ev.Id == input.ExcludeEventId);
                if (events[i].Any(ev => Math.Max(ev.StartDate.Ticks, start.Ticks) < Math.Min(ev.EndDate.Ticks, end.Ticks)))
                {
                    conflictingUsers.Add(input.UserIds[i]);
                }
            }

            if (conflictingUsers.Count == 0)
            {
                return new CommonDateOutput() { ConflictingUsers = conflictingUsers.ToArray(), CommonDate = DateTime.MinValue };
            }

            var allEvents = new List<Event>();
            foreach (var eventList in events)
            {
                allEvents.AddRange(eventList);
            }
            allEvents.Sort((x, y) =>
            {
                if (x.StartDate != y.StartDate)
                {
                    return x.StartDate.CompareTo(y.StartDate);
                }
                return x.EndDate.CompareTo(y.EndDate);
            });

            var duration = end - start;
            DateTime currentWindowStart = CalculateStartDate(start, startMinutes, endMinutes); new DateTime(Math.Max(start.Ticks, start.Subtract(start.TimeOfDay).AddMinutes(startMinutes).Ticks));
            foreach (var ev in allEvents)
            {
                if (currentWindowStart < ev.StartDate)
                {
                    DateTime currentWindowEnd = CalculateEndDate(ev.StartDate, startMinutes, endMinutes, duration);
                    if (currentWindowEnd - currentWindowStart >= duration)
                    {
                        return new CommonDateOutput() { ConflictingUsers = conflictingUsers.ToArray(), CommonDate = currentWindowStart };
                    }
                }
                if (ev.EndDate > currentWindowStart)
                {
                    currentWindowStart = CalculateStartDate(ev.EndDate, startMinutes, endMinutes);
                }
            }
            return new CommonDateOutput() { ConflictingUsers = conflictingUsers.ToArray(), CommonDate = currentWindowStart };
        }

        private DateTime GetDate(int day, DateTime duringWeek, bool currentWeek)
        {
            int dayOfWeek = (int)(duringWeek.DayOfWeek);
            if (dayOfWeek == 0)
            {
                dayOfWeek = 7;
            }
            var currentWeekDate = duringWeek.AddDays(-1 * dayOfWeek + 1).AddDays(day % 7); // starts from monday
            if (!currentWeek)
            {
                return currentWeekDate.AddDays(7);
            }
            return currentWeekDate;
        }

        private bool IsDay(Event ev, DateTime date)
        {
            return ev.StartDate < date.AddDays(1) && ev.EndDate >= date;
        }

        private bool IsDay(Models.Task task, DateTime date)
        {
            var days = new List<DateTime?>()
            {
                task.Date0, task.Date1, task.Date2, task.Date3, task.Date4, task.Date5, task.Date6
            };
            foreach (var day in days)
            {
                if (day.HasValue && day.Value >= date && day.Value < date.AddDays(1))
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

        private async Task<List<Event>> FindEventsForUser(string userId)
        {
            var events = await _context.Events.Where(ev => ev.OwnerId == userId).ToListAsync();
            var attendedEventsIds = await _context.UsersEvents.Where(ue => ue.Status == 1 && ue.UserId == userId).Select(ue => ue.EventId).ToListAsync();
            foreach (var ae in attendedEventsIds)
            {
                var attendedEvent = await _context.Events.FindAsync(ae);
                if (attendedEvent != null)
                {
                    events.Add(attendedEvent);
                }
            }
            return events;
        }

        private DateTime CalculateStartDate(DateTime date, double startMinutes, double endMinutes)
        {
            var result = new DateTime(Math.Max(date.Ticks, date.Subtract(date.TimeOfDay).AddMinutes(startMinutes).Ticks));
            if (result.TimeOfDay.TotalMinutes >= endMinutes)
            {
                result = result.Subtract(result.TimeOfDay).AddDays(1).AddMinutes(startMinutes);
            }
            return result;
        }

        private DateTime CalculateEndDate(DateTime date, double startMinutes, double endMinutes, TimeSpan duration)
        {
            var result = new DateTime(Math.Min(date.Ticks, date.Subtract(date.TimeOfDay).AddMinutes(endMinutes).Ticks));
            if (result.TimeOfDay.TotalMinutes < startMinutes)
            {
                result = result.Subtract(result.TimeOfDay).AddDays(-1).AddMinutes(-24 * 60 + endMinutes).Subtract(duration);
            }
            return result;
        }
    }
}
