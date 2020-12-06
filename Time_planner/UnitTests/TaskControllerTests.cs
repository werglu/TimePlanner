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
    public class TaskControllerTests
    {
        [Fact]
        public async void CanGetAllTasks()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

            using (var context = new DatabaseContext(options))
            {
                context.Tasks.Add(new Time_planner_api.Models.Task()
                {
                    Id = 1,
                    Category = new ListCategory() { Id = 1, Category = "CategoryName" },
                    Title = "Task1",
                    CategoryId = 1,
                    IsDone = false
                });
                context.SaveChanges();
                var controller = new TasksController(context);
                var result = await controller.GetTasks();
                var count = result.Value.Count();
                var value = result.Value.ToArray();
                Assert.Equal(1, count);
                Assert.Equal("Task1", ((Time_planner_api.Models.Task)value[0]).Title);
                Assert.False(((Time_planner_api.Models.Task)value[0]).IsDone);
            }
        }

        //[Fact]
        //public async void ThrowsWhenSavingDatesForNonExistingTasks()
        //{
        //    var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

        //    using (var context = new DatabaseContext(options))
        //    {
        //        var controller = new TasksController(context);
        //        var result = await controller.SaveDates(new List<TaskAssignmentSave>()
        //        {
        //            new TaskAssignmentSave() { TaskId = 2, DayTimes = new bool[] { false, false, false, false, false, false, false } }
        //        });
        //        Assert.IsType<NotFoundResult>(result.Result);
        //    }
        //}
    }
}
