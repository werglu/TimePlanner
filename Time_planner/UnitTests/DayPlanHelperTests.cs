using Microsoft.EntityFrameworkCore;
using System;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;
using System.Linq;
using Time_planner_api.Helpers;
using System.Collections.Generic;

namespace UnitTests
{
    public class DayPlanHelperTests
    {
        [Fact]
        public void DoesNotPlanTasksWhenThereIsNoTime()
        {
            var events = new List<Event>()
            {
                new Event() { Id = 1, StartDate = DateTime.Today, EndDate = DateTime.Today.AddDays(1).AddMinutes(-1) }
            };
            var tasks = new List<Task>()
            {
                new Task() { Id = 1234, Title = "*", Time = 100, Split = 1 },
                new Task() { Id = 234, Title = "***", Time = 100, Split = 1 },
                new Task() { Id = 34, Title = "*****", Time = 100, Split = 1 },
                new Task() { Id = 4, Title = "*******", Time = 100, Split = 1 },
                new Task() { Id = 5, Title = "   ||   ", Time = 100, Split = 1 }
            };
            var result = DayPlanHelper.FindShortestRoute(events, tasks, DateTime.Now, 0.0, 1439.0);
            Assert.All(result, item => Assert.False(item.Assigned && item.T != null));
        }

        [Fact]
        public void ReturnsNotPlannedTasks()
        {
            var tasks = new List<Task>()
            {
                new Task() { Id = 1, Title = "  /\\  " },
                new Task() { Id = 2, Title = "--  --" },
                new Task() { Id = 3, Title = "\\    /" },
                new Task() { Id = 4, Title = "/    \\" },
                new Task() { Id = 5, Title = "--  --" },
                new Task() { Id = 6, Title = "  \\/  " }
            };
            var result = DayPlanHelper.FindShortestRoute(new List<Event>(), tasks, DateTime.Now, 0.0, 10000.0);
            Assert.Equal(tasks.Count, result.Count);
        }
    }
}
