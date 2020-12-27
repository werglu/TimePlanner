using Microsoft.EntityFrameworkCore;
using System;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;
using System.Linq;
using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace UnitTests
{
    public class UsersControllerTests : TestsBase
    {
        //[Fact]
        //public async void GetUsers_returnsAllUsers()
        //{
        //    var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

        //    using (var context = new DatabaseContext(options))
        //    {
        //        // Arrange
        //        int id = 0;

        //        // Act
        //        var controller = new UsersController(context);
        //        var users = await controller.GetUsers();
        //        var beginningCount = users.Value.Count();
        //        context.Users.Add(new User() { FacebookId = (++id).ToString() });
        //        context.Users.Add(new User() { FacebookId = (++id).ToString() });
        //        context.Users.Add(new User() { FacebookId = (++id).ToString() });
        //        context.SaveChanges();

        //        var result = await controller.GetUsers();

        //        // Assert
        //        var EndCount = result.Value.Count();
        //        var expectedDifference = 3;
        //        Assert.Equal(expectedDifference, EndCount - beginningCount);
        //    }
        //}

        [Fact]
        public async void GetUser_withProperId_returnsUser()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

            using (var context = new DatabaseContext(options))
            {
                // Arrange
                int userId = 5;
                context.Users.Add(new User() { FacebookId = userId.ToString() });
                context.SaveChanges();

                // Act
                var controller = new UsersController(context, null, null);
                AddUserClaim(controller, userId.ToString());
                var result = await controller.GetUser();

                // Assert
                Assert.IsType<User>(result.Value);
                var expectedId = userId.ToString();
                Assert.Equal(expectedId, result.Value.FacebookId);
            }
        }

        [Fact]
        public async void GetUser_returnsNotFound()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

            using (var context = new DatabaseContext(options))
            {
                // Arrange
                int userId = 6;

                // Act
                var controller = new UsersController(context, null, null);
                AddUserClaim(controller, userId.ToString());
                var result = await controller.GetUser();

                // Assert
                Assert.IsType<NotFoundResult>(result.Result);
            }
        }

        //[Fact]
        //public async void PostUser_addsUserAndReturnsOk()
        //{
        //    var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

        //    using (var context = new DatabaseContext(options))
        //    {
        //        // Arrange
        //        int userId1 = 7;
        //        int userId2 = 8;

        //        // Act
        //        var controller = new UsersController(context);
        //        var users = await controller.GetUsers();
        //        var beginningCount = users.Value.Count();
        //        var result = await controller.PostUser(userId1.ToString());
        //        var result2 = await controller.PostUser(userId2.ToString());

        //        // Assert
        //        Assert.IsType<OkResult>(result);
        //        Assert.IsType<OkResult>(result2);

        //        users = await controller.GetUsers();
        //        var endCount = users.Value.Count();
        //        var expectedDifference = 2;
        //        Assert.Equal(expectedDifference, endCount - beginningCount);
        //    }
        //}

        //[Fact]
        //public async void PostUser_whenTryingAddExistingUser_ReturnsNoContent()
        //{
        //    var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

        //    using (var context = new DatabaseContext(options))
        //    {
        //        // Arrange
        //        int userId = 9;

        //        // Act
        //        var controller = new UsersController(context);
        //        var result = await controller.PostUser(userId.ToString());
        //        var result2 = await controller.PostUser(userId.ToString());

        //        // Assert
        //        Assert.IsType<NoContentResult>(result2);
        //    }
        //}

        //[Fact]
        //public async void DeleteUser_ReturnsDeletedUser()
        //{
        //    var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

        //    using (var context = new DatabaseContext(options))
        //    {
        //        // Arrange
        //        int userId1 = 10;
        //        int userId2 = 11;
        //        int userId3 = 12;
        //        context.Users.Add(new User() { FacebookId = userId1.ToString() });
        //        context.Users.Add(new User() { FacebookId = userId2.ToString() });
        //        context.Users.Add(new User() { FacebookId = userId3.ToString() });
        //        context.SaveChanges();

        //        // Act
        //        var controller = new UsersController(context);
        //        var users = await controller.GetUsers();
        //        var beginningCount = users.Value.Count();
        //        var result = await controller.DeleteUser(userId1.ToString());

        //        // Assert
        //        Assert.IsType<User>(result.Value);

        //        var expectedId = userId1.ToString();
        //        Assert.Equal(expectedId, result.Value.FacebookId);

        //        users = await controller.GetUsers();
        //        var endCount = users.Value.Count();
        //        var expectedDifference = 1;
        //        Assert.Equal(expectedDifference, beginningCount - endCount);
        //    }
        //}
    }
}
