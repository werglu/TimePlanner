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
    public class PlanningControllerTests : TestsBase
    {
        [Fact]
        public async void ThrowsWhenSavingDatesForNonExistingTasks()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "PlanningTest1").Options;
            var taskId = 2;
            var userId = "1234";

            using (var context = new DatabaseContext(options))
            {
                var controller = new PlanningController(context);
                AddUserClaim(controller, userId);
                context.Tasks.Add(new Time_planner_api.Models.Task()
                {
                    Id = taskId,
                    Category = new ListCategory() { Id = 1, Category = "CategoryName", OwnerId = userId },
                    Title = "Task1",
                    CategoryId = 1,
                    IsDone = false
                });
                var result = await controller.SaveDates(new List<TaskAssignmentSave>()
                {
                    new TaskAssignmentSave() { TaskId = taskId, DayTimes = new bool[] { false, false, false, false, false, false, false } }
                }, false, 1, 1, 1);
                Assert.IsType<NotFoundResult>(result.Result);
            }
        }

        [Fact]
        public async void DoesNotProposeDoneTasks()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "PlanningTest2").Options;

            using (var context = new DatabaseContext(options))
            {
                string userId = "fbid";
                context.Users.Add(new User() { FacebookId = userId });
                context.ListCategories.Add(new ListCategory() { Id = 1, Category = "bb", OwnerId = userId });
                context.Tasks.Add(new Time_planner_api.Models.Task() { Id = 1, Title = "aa", CategoryId = 1, IsDone = true });
                context.SaveChanges();
                var controller = new PlanningController(context);
                AddUserClaim(controller, userId);
                var result = await controller.FindTasksForToday();
                Assert.Empty(result.Value);
            }
        }


        [Fact]
        public async void DoesNotProposeFullyAssignedTasks()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "PlanningTest3").Options;

            using (var context = new DatabaseContext(options))
            {
                string userId = "fbid";
                context.Users.Add(new User() { FacebookId = userId });
                context.ListCategories.Add(new ListCategory() { Id = 1, Category = "bb", OwnerId = userId });
                context.Tasks.Add(new Time_planner_api.Models.Task()
                {
                    Id = 1,
                    Title = "aa",
                    CategoryId = 1,
                    Date0 = DateTime.Now,
                    Date1 = DateTime.Now.AddDays(-3),
                    Date2 = DateTime.Now.AddDays(5),
                    Date3 = DateTime.Now.AddDays(8),
                    Date4 = DateTime.Now.AddMonths(1),
                    Date5 = DateTime.Now.AddYears(-3),
                    Date6 = DateTime.Now.AddMinutes(919)
                });
                context.SaveChanges();
                var controller = new PlanningController(context);
                AddUserClaim(controller, userId);
                var result = await controller.FindTasksForToday();
                Assert.Empty(result.Value);
            }
        }
    }
}
