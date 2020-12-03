﻿using System;
using System.Collections.Generic;
using System.Linq;
using Time_planner_api.Models;

namespace Time_planner_api.Helpers
{
    public class DayPlanHelper
    {
        public static List<CalendarItem> FindShortestRoute(List<Event> eventsToPlan, List<Task> tasksToPlan, double startMinutes, double endMinutes)
        {
            var events = eventsToPlan.Select(x => x).ToList();
            var tasks = tasksToPlan.Select(x => x).ToList();
            var result = new List<CalendarItem>();
            var tasksLeftOut = new List<CalendarItem>();

            tasksLeftOut.AddRange(tasks.Where(x => !x.Longitude.HasValue || !x.Latitude.HasValue || !x.Time.HasValue || !x.Split.HasValue).Select(t => new CalendarItem { T = t, Assigned = false }).ToList());
            tasks.RemoveAll(x => !x.Longitude.HasValue || !x.Latitude.HasValue || !x.Time.HasValue || !x.Split.HasValue);

            events.Sort((x, y) =>
            {
                if (x.StartDate != y.StartDate)
                {
                    return x.StartDate.CompareTo(y.StartDate);
                }
                return x.EndDate.CompareTo(y.EndDate);
            });
            result.AddRange(events.Select(ev => new CalendarItem { E = ev, Assigned = true }).ToList());

            (DateTime, double, double) currentWindowStart = (DateTime.Today.AddMinutes(startMinutes), double.MaxValue, double.MaxValue);
            var dayEnd = DateTime.Today.AddMinutes(endMinutes);
            foreach (var ev in events)
            {
                if (currentWindowStart.Item1 < ev.StartDate)
                {
                    (DateTime, double, double) currentWindowEnd = (ev.StartDate, ev.Latitude, ev.Longitude);
                    if (dayEnd < currentWindowEnd.Item1)
                    {
                        currentWindowEnd = (dayEnd, double.MaxValue, double.MaxValue);
                    }
                    result.InsertRange(result.FindIndex(x => x.E == ev), GetTasksBetween(tasks, currentWindowStart, currentWindowEnd));
                }
                if (ev.EndDate > currentWindowStart.Item1)
                {
                    currentWindowStart = (ev.EndDate, ev.Latitude, ev.Longitude);
                }
            }
            if (currentWindowStart.Item1 < dayEnd)
            {
                result.AddRange(GetTasksBetween(tasks, currentWindowStart, (dayEnd, double.MaxValue, double.MaxValue)));
            }

            result.AddRange(tasks.Select(x => new CalendarItem { T = x, Assigned = false }));
            result.AddRange(tasksLeftOut);
            return result;
        }

        private static List<CalendarItem> GetTasksBetween(List<Task> tasks, (DateTime, double, double) start, (DateTime, double, double) end)
        {
            (double, double) centralPoint = start.Item2 < double.MaxValue ?
                (end.Item2 < double.MaxValue ? ((start.Item2 + end.Item2) / 2, (start.Item3 + end.Item3) / 2) :
                (start.Item2, start.Item3)) : (end.Item2, end.Item3);
            if (centralPoint.Item1 < double.MaxValue)
            {
                tasks.Sort((x, y) => GetDistance(x, centralPoint).CompareTo(GetDistance(y, centralPoint)));
            }
            else
            {
                tasks.Sort((x, y) => (x.Time.Value / x.Split.Value).CompareTo(y.Time.Value / y.Split.Value));
            }

            var tasksBetween = new List<Task>();
            var timeLeft = (int)(end.Item1 - start.Item1).TotalMinutes;
            foreach(var task in tasks)
            {
                if (task.Time.Value / task.Split.Value <= timeLeft)
                {
                    tasksBetween.Add(task);
                    timeLeft -= task.Time.Value / task.Split.Value;
                }
            }

            if (tasksBetween.Count == 0)
            {
                return new List<CalendarItem>();
            }

            tasks.RemoveAll(t => tasksBetween.Any(tt => tt.Id == t.Id));

            tasksBetween = SalesmanHelper.FindShortestRoute(tasksBetween);
            var bestDistance = double.MaxValue;
            int bestIndex = 0;
            int index = 0;
            var prevTask = tasks.Last();
            foreach (var task in tasksBetween)
            {
                double distance = 0.0;
                if (start.Item2 < double.MaxValue)
                {
                    distance += GetDistance(task, (start.Item2, start.Item3));
                }
                if (end.Item2 < double.MaxValue)
                {
                    distance += GetDistance(prevTask, (end.Item2, end.Item3));
                }
                if (distance < bestDistance)
                {
                    bestDistance = distance;
                    bestIndex = index;
                }
                index++;
                prevTask = task;
            }

            var result = new List<CalendarItem>();
            result.AddRange(tasksBetween.GetRange(bestIndex, tasksBetween.Count - bestIndex).Select(x => new CalendarItem { T = x, Assigned = true }).ToList());
            if (bestIndex > 0)
            {
                result.AddRange(tasksBetween.GetRange(0, bestIndex).Select(x => new CalendarItem { T = x, Assigned = true }).ToList());
            }
            return result;
        }

        private static double GetDistance(Task task, (double, double) point)
        {
            return (task.Latitude.Value - point.Item1) * (task.Latitude.Value - point.Item1) + (task.Longitude.Value - point.Item2) * (task.Longitude.Value - point.Item2);
        }
    }
}
