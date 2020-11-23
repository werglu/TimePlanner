using Microsoft.EntityFrameworkCore;
using System;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;
using System.Linq;

namespace UnitTests
{
    public class EventControllerTests
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
    }
}
