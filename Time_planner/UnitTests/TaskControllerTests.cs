using Microsoft.EntityFrameworkCore;
using System;
using Time_planner_api.Controllers;
using Xunit;
using System.Linq;
using Time_planner_api.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;

namespace UnitTests
{
    public class TaskControllerTests : TestsBase
    {
        [Fact]
        public async void can_get_all_tasks()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "TaskTest").Options;
            string userId = "123";

            using (var context = new DatabaseContext(options))
            {
                context.Tasks.Add(new Task()
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
                Assert.Equal("Task1", (value[0]).Title);
                Assert.False((value[0]).IsDone);
            }
        }

        [Fact]
        public async void getting_task_from_not_owned_category_should_return_unauthorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "TaskTest1").Options;
            string userId = "123";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = "2", Category = "categoryName" });
                context.SaveChanges();

                context.Tasks.Add(new Task()
                {
                    Id = 1,
                    Title = "Task1",
                    CategoryId = 1,                 
                    IsDone = false
                });

                context.SaveChanges();
                var controller = new TasksController(context);
                AddUserClaim(controller, userId);

                var result = await controller.GetTask(1);

                result.Result.Should().BeOfType<UnauthorizedResult>();
            }
        }


        [Fact]
        public async void can_get_task()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "TaskTest2").Options;
            string userId = "123";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = userId, Category = "categoryName" });
                context.SaveChanges();

                context.Tasks.Add(new Task()
                {
                    Id = 1,
                    Title = "Task1",
                    CategoryId = 1,
                    IsDone = false
                });

                context.SaveChanges();
                var controller = new TasksController(context);
                AddUserClaim(controller, userId);

                var result = await controller.GetTask(1);

                result.Value.Title.Should().Be("Task1");
            }
        }


        [Fact]
        public async void can_add_task()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "TaskTest3").Options;
            string userId = "123";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = userId, Category = "categoryName" });
                context.SaveChanges();

                context.Tasks.Add(new Task()
                {
                    Id = 1,
                    Title = "Task1",
                    CategoryId = 1,
                    IsDone = false
                });

                context.SaveChanges();
                var controller = new TasksController(context);
                AddUserClaim(controller, userId);

                var result = await controller.PostTask(new Task()
                { 
                    Id = 2,
                    Title = "Task2",
                    CategoryId = 1,
                    IsDone = false
                });

                context.Tasks.Count().Should().Be(2);
                Assert.True(context.Tasks.Any(t => t.Title == "Task2"));
            }
        }


        [Fact]
        public async void adding_task_to_not_owned_category_should_return_unauthorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "TaskTest4").Options;
            string userId = "123";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = "2", Category = "categoryName" });
                context.SaveChanges();

                context.Tasks.Add(new Task()
                {
                    Id = 1,
                    Title = "Task1",
                    CategoryId = 1,
                    IsDone = false
                });

                context.SaveChanges();
                var controller = new TasksController(context);
                AddUserClaim(controller, userId);

                var result = await controller.PostTask(new Task()
                {
                    Id = 2,
                    Title = "Task2",
                    CategoryId = 1,
                    IsDone = false
                });

                result.Result.Should().BeOfType<UnauthorizedResult>();
            }
        }


        [Fact]
        public async void can_edit_task()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "TaskTest5").Options;
            string userId = "123";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = userId, Category = "categoryName" });
                context.SaveChanges();

                context.Tasks.Add(new Task()
                {
                    Id = 1,
                    Title = "Task1",
                    CategoryId = 1,
                    IsDone = false
                });

                context.SaveChanges();
                var controller = new TasksController(context);
                AddUserClaim(controller, userId);

                var result = await controller.PutTask(1, new Task()
                {
                    Id = 1,
                    Title = "Task2",
                    CategoryId = 1,
                    IsDone = false
                });

                Assert.True(context.Tasks.Any(t => t.Title == "Task2"));
                context.Tasks.Count().Should().Be(1);
            }
        }

        [Fact]
        public async void editing_task_to_not_owned_category_should_return_unauthorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "TaskTest6").Options;
            string userId = "123";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = "2", Category = "categoryName" });
                context.SaveChanges();

                context.Tasks.Add(new Task()
                {
                    Id = 1,
                    Title = "Task1",
                    CategoryId = 1,
                    IsDone = false
                });

                context.SaveChanges();
                var controller = new TasksController(context);
                AddUserClaim(controller, userId);

                var result = await controller.PutTask(1, new Task()
                {
                    Id = 1,
                    Title = "Task2",
                    CategoryId = 1,
                    IsDone = false
                });

                result.Should().BeOfType<UnauthorizedResult>();
            }
        }


        [Fact]
        public async void can_delete_task()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "TaskTest7").Options;
            string userId = "123";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = userId, Category = "categoryName" });
                context.SaveChanges();

                context.Tasks.Add(new Task()
                {
                    Id = 1,
                    Title = "Task1",
                    CategoryId = 1,
                    IsDone = false
                });

                context.SaveChanges();
                var controller = new TasksController(context);
                AddUserClaim(controller, userId);
                context.Tasks.Count().Should().Be(1);

                var result = await controller.DeleteTask(1);

                context.Tasks.Count().Should().Be(0);
            }
        }

        [Fact]
        public async void deleting_task_with_not_owned_category_should_return_unathorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "TaskTest8").Options;
            string userId = "123";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = "2", Category = "categoryName" });
                context.SaveChanges();

                context.Tasks.Add(new Task()
                {
                    Id = 1,
                    Title = "Task1",
                    CategoryId = 1,
                    IsDone = false
                });

                context.SaveChanges();
                var controller = new TasksController(context);
                AddUserClaim(controller, userId);
                context.Tasks.Count().Should().Be(1);

                var result = await controller.DeleteTask(1);

                context.Tasks.Count().Should().Be(1);
                result.Result.Should().BeOfType<UnauthorizedResult>();
            }
        }

    }
}
