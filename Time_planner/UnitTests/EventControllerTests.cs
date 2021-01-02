using Microsoft.EntityFrameworkCore;
using System;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;
using System.Linq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;

namespace UnitTests
{
    public class EventControllerTests : TestsBase
    {
        [Fact]
        public async void can_get_all_events_per_user()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "EventTest1").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.Events.Add(new Event() { Id = 1, StartDate = new DateTime(), EndDate = new DateTime(), Title = "Event1", OwnerId = userId });
                context.SaveChanges();
                var controller = new EventsController(context);
                AddUserClaim(controller, userId);
                var result = await controller.GetEvents("1");
                var count = result.Value.Count();
                var value = result.Value.ToArray();
                Assert.Equal(1, count);
                Assert.Equal("Event1", (value[0]).Title);
            }
        }

        [Fact]
        public async void can_get_one_event()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "EventTest2").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.Events.Add(new Event() { Id = 1, StartDate = new DateTime(), EndDate = new DateTime(), Title = "Event1", OwnerId = userId });
                context.SaveChanges();
                var controller = new EventsController(context);
                AddUserClaim(controller, userId);

                var result = await controller.GetEvent(1);

                result.Value.Id.Should().Be(1);
                result.Value.OwnerId.Should().Be("1");
            }
        }

        [Fact]
        public async void when_get_not_existing_event_should_get_not_found()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "EventTest3").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.Events.Add(new Event() { Id = 1, StartDate = new DateTime(), EndDate = new DateTime(), Title = "Event1", OwnerId = "1" });
                context.SaveChanges();
                var controller = new EventsController(context);
                AddUserClaim(controller, userId);

                var result = await controller.GetEvent(2);

                result.Result.Should().BeOfType<NotFoundResult>();
            }
        }

        [Fact]
        public async void can_add_event()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "EventTest4").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.Events.Add(new Event() { Id = 1, StartDate = new DateTime(), EndDate = new DateTime(), Title = "Event1", OwnerId = userId });
                context.SaveChanges();
                var controller = new EventsController(context);
                AddUserClaim(controller, userId);

                Assert.Equal(1, context.Events.Count());

                var result = await controller.PostEvent(new EventWithFriends { 
                    Event = new Event() { Title = "newEvent", OwnerId = userId },
                    FriendIds = new string[] {"2", "3"}
                });

                Assert.Equal(2, context.Events.Count());
                Assert.True(context.Events.Any(e => e.Title == "newEvent"));
            }
        }

        [Fact]
        public async void adding_event_with_other_ownedId_should_return_unauthorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "EventTest5").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.Events.Add(new Event() { Id = 1, StartDate = new DateTime(), EndDate = new DateTime(), Title = "Event1", OwnerId = userId });
                context.SaveChanges();
                var controller = new EventsController(context);
                AddUserClaim(controller, userId);

                Assert.Equal(1, context.Events.Count());

                var result = await controller.PostEvent(new EventWithFriends
                {
                    Event = new Event() { Title = "newEvent", OwnerId = "2" },
                    FriendIds = new string[] { "2", "3" }
                });

                result.Result.Should().BeOfType<UnauthorizedResult>();
            }
        }

        [Fact]
        public async void can_edit_event()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "EventTest6").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.Events.Add(new Event() { Id = 1, StartDate = new DateTime(), EndDate = new DateTime(), Title = "Event1", OwnerId = userId });
                context.SaveChanges();
                var controller = new EventsController(context);
                AddUserClaim(controller, userId);

                Assert.Equal(1, context.Events.Count());

                var result = await controller.PutEvent(1, new Event()
                {
                    Id = 1,
                    Title = "editedEvent",
                    OwnerId = userId
                });

                Assert.Equal(1, context.Events.Count());
                Assert.True(context.Events.Any(e => e.Title == "editedEvent"));
            }
        }

        [Fact]
        public async void edit_event_not_owned_should_return_unauthorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "EventTest7").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.Events.Add(new Event() { Id = 1, StartDate = new DateTime(), EndDate = new DateTime(), Title = "Event1", OwnerId = userId });
                context.SaveChanges();
                var controller = new EventsController(context);
                AddUserClaim(controller, userId);

                Assert.Equal(1, context.Events.Count());

                var result = await controller.PutEvent(1, new Event()
                {
                    Id = 1,
                    Title = "editedEvent",
                    OwnerId = "2"
                });

                result.Should().BeOfType<UnauthorizedResult>();
            }
        }


        [Fact]
        public async void can_delete_event()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "EventTest8").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.Events.Add(new Event() { Id = 1, StartDate = new DateTime(), EndDate = new DateTime(), Title = "Event1", OwnerId = userId });
                context.SaveChanges();
                var controller = new EventsController(context);
                AddUserClaim(controller, userId);

                Assert.Equal(1, context.Events.Count());

                var result = await controller.DeleteEvent(1);

                Assert.Equal(0, context.Events.Count());
            }
        }


        [Fact]
        public async void delete_event_not_ownedshould_return_unauthorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "EventTest8").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.Events.Add(new Event() { Id = 1, StartDate = new DateTime(), EndDate = new DateTime(), Title = "Event1", OwnerId = "2" });
                context.SaveChanges();
                var controller = new EventsController(context);
                AddUserClaim(controller, userId);

                Assert.Equal(1, context.Events.Count());

                var result = await controller.DeleteEvent(1);

                result.Result.Should().BeOfType<UnauthorizedResult>();
            }
        }
    }
}
