using Microsoft.EntityFrameworkCore;
using System;
using Time_planner_api.Controllers;
using Xunit;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Time_planner_api.Models;
using Microsoft.AspNetCore.Mvc;

namespace UnitTests
{
    public class TaskControllerTests : TestsBase
    {
        [Fact]
        public async void CanGetAllTasks()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "TaskTest").Options;
            string userId = "123";

            using (var context = new DatabaseContext(options))
            {
                context.Tasks.Add(new Time_planner_api.Models.Task()
                {
                    Id = 1,
                    Category = new ListCategory() { Id = 1, Category = "CategoryName", OwnerId = userId },
                    Title = "Task1",
                    CategoryId = 1,
                    IsDone = false
                });
                context.SaveChanges();
                var controller = new TasksController(context);
                AddUserClaim(controller, userId);
                var result = await controller.GetTasks();
                var count = result.Value.Count();
                var value = result.Value.ToArray();
                Assert.Equal(1, count);
                Assert.Equal("Task1", ((Time_planner_api.Models.Task)value[0]).Title);
                Assert.False(((Time_planner_api.Models.Task)value[0]).IsDone);
            }
        }
    }
}
