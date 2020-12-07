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
        public async void DoesNotPlanTasksWithoutTime()
        {
            var tasks = new List<Task>()
            {
                new Task() { Id = 1234, Title = "*" },
                new Task() { Id = 234, Title = "***" },
                new Task() { Id = 34, Title = "*****" },
                new Task() { Id = 4, Title = "*******" },
                new Task() { Id = 5, Title = "   ||   " }
            };
            var result = DayPlanHelper.FindShortestRoute(new List<Event>(), tasks, DateTime.Now, 0.0, 10000.0);
            Assert.All(result, item => Assert.False(item.Assigned));
        }

        [Fact]
        public async void ReturnsNotPlannedTasks()
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
