using Microsoft.EntityFrameworkCore;
using System;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;
using System.Linq;
using Time_planner_api.Helpers;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace UnitTests
{
    public class SalesmanHelperTests
    {
        [Fact]
        public void DoesNotTakeTooLongWhenManyTasks()
        {
            int taskCount = 1000000;
            var tasks = new List<Time_planner_api.Models.Task>();
            var rnd = new Random();
            while (taskCount-- > 0)
            {
                // todo: to be changed when there would be proper latitude/longitude to set
                tasks.Add(new Time_planner_api.Models.Task() { Id = rnd.Next(), Title = rnd.Next().ToString(), City = rnd.Next().ToString(), StreetAddress = rnd.Next().ToString() });
            }

            int timeout = 5;
            var task = System.Threading.Tasks.Task.Run(() => SalesmanHelper.FindShortestRoute(tasks));
            var completed = System.Threading.Tasks.Task.WaitAll(new[] { task }, TimeSpan.FromSeconds(timeout));

            if (task.Exception != null)
            {
                if (task.Exception.InnerExceptions.Count == 1)
                {
                    throw task.Exception.InnerExceptions[0];
                }
                throw task.Exception;
            }

            if (!completed)
            {
                throw new TimeoutException();
            }
        }
    }
}
