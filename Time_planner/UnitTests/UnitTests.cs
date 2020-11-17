using Microsoft.EntityFrameworkCore;
using System;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;
using System.Linq;

namespace UnitTests
{
    public class UnitTests
    {
        [Fact]
        public async void CanGetAllEvents()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

            using (var context = new DatabaseContext(options))
            {
                context.Events.Add(new Time_planner_api.Models.Event() { Id = 1, StartDate = new DateTime(), EndDate = new DateTime(), Title = "Event1" });
                context.SaveChanges();
                var controller = new EventsController(context);
                var result = await controller.GetEvents("1");
                var count = result.Value.Count();
                var value = result.Value.ToArray();
                Assert.Equal(1, count);
                Assert.Equal("Event1", ((Time_planner_api.Models.Event)value[0]).Title);
            }
        }

        [Fact]
        public async void CanGetAllTasks()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

            using (var context = new DatabaseContext(options))
            {
                context.Tasks.Add(new Time_planner_api.Models.Task() { Id = 1, Category = new ListCategory() { Id = 1, Category = "CategoryName" },
                    Title = "Task1", CategoryId = 1, IsDone = false });
                context.SaveChanges();
                var controller = new TasksController(context);
                var result = await controller.GetTasks();
                var count = result.Value.Count();
                var value = result.Value.ToArray();
                Assert.Equal(1, count);
                Assert.Equal("Task1", ((Time_planner_api.Models.Task)value[0]).Title);
                Assert.Equal(false, ((Time_planner_api.Models.Task)value[0]).IsDone);
            }
        }
    }
}
