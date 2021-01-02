using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;
using FluentValidation;
using FluentAssertions;

namespace UnitTests
{
    public class NotificationsControllerTests : TestsBase
    {
        [Fact]
        public async void get_notifications_should_return_all_notifications_per_user()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "NotificationTest").Options;
            string userId = "1";

            using (var context = new DatabaseContext(options))
            {
                // Act
                var controller = new NotificationsController(context);
                AddUserClaim(controller, userId);
                context.Users.Add(new User() { FacebookId = userId });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 1, Id = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 1, Id = 2 });
                context.SaveChanges();
                var notifications = await controller.GetNotifications();

                // Assert
                var notificationsCount = notifications.Value.Count();
                Assert.Equal(1, notificationsCount);
            }
        }

        [Fact]
        public async void can_dismiss_notification()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "NotificationTest1").Options;
            string userId = "1";

            using (var context = new DatabaseContext(options))
            {
                // Act
                var controller = new NotificationsController(context);
                AddUserClaim(controller, userId);
                context.Users.Add(new User() { FacebookId = userId });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 1, Id = 1, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 1, Id = 2, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 1, Id = 3, EventId = 2 });
                context.SaveChanges();
                Assert.Equal(3, context.Notifications.Count());
                Assert.False(context.Notifications.Where(n => n.Id == 1).Single().IsDismissed);

                await controller.DismissNotification(1);

                // Assert
                Assert.Equal(3, context.Notifications.Count());
                Assert.True(context.Notifications.Where(n => n.Id == 1).Single().IsDismissed);
            }
        }

        [Fact]
        public async void notification_can_be_accepted()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "NotificationTest2").Options;
            string userId = "1";

            using (var context = new DatabaseContext(options))
            {
                // Act
                var controller = new NotificationsController(context);
                AddUserClaim(controller, userId);
                context.Users.Add(new User() { FacebookId = userId });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 0, Id = 1, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 0, Id = 2, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 0, Id = 3, EventId = 2 });
                context.SaveChanges();
                Assert.Equal(3, context.Notifications.Count());
                Assert.False(context.Notifications.Where(n => n.Id == 1).Single().IsDismissed);

                await controller.AcceptNotification(1);

                // Assert
                Assert.Equal(4, context.Notifications.Count());
                Assert.True(context.Notifications.Any(n => n.MessageType == 1));
                Assert.True(context.Notifications.Any(n => n.SenderId == "1"));
            }
        }


        [Fact]
        public async void accept_notification_with_other_reciver_should_return_unauthorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "NotificationTest8").Options;
            string userId = "1";

            using (var context = new DatabaseContext(options))
            {
                // Act
                var controller = new NotificationsController(context);
                AddUserClaim(controller, userId);
                context.Users.Add(new User() { FacebookId = userId });
                context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 0, Id = 1, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 0, Id = 2, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 0, Id = 3, EventId = 2 });
                context.SaveChanges();
                Assert.Equal(3, context.Notifications.Count());
                Assert.False(context.Notifications.Where(n => n.Id == 1).Single().IsDismissed);

                var result = await controller.AcceptNotification(1);

                // Assert
                result.Should().BeOfType<UnauthorizedResult>();
            }
        }

        [Fact]
        public async void notification_can_be_rejected()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "NotificationTest3").Options;
            string userId = "1";

            using (var context = new DatabaseContext(options))
            {
                // Act
                var controller = new NotificationsController(context);
                AddUserClaim(controller, userId);
                context.Users.Add(new User() { FacebookId = userId });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 0, Id = 1, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 0, Id = 2, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 0, Id = 3, EventId = 2 });
                context.SaveChanges();
                Assert.Equal(3, context.Notifications.Count());
                Assert.False(context.Notifications.Where(n => n.Id == 1).Single().IsDismissed);

                await controller.RejectNotification(1);

                // Assert
                Assert.Equal(4, context.Notifications.Count());
                Assert.True(context.Notifications.Any(n => n.MessageType == 2));
                Assert.True(context.Notifications.Any(n => n.SenderId == "1"));
            }
        }

        [Fact]
        public async void reject_notification_with_other_reciver_should_return_unauthorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "NotificationTest6").Options;
            string userId = "1";

            using (var context = new DatabaseContext(options))
            {
                // Act
                var controller = new NotificationsController(context);
                AddUserClaim(controller, userId);
                context.Users.Add(new User() { FacebookId = userId });
                context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 0, Id = 1, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 0, Id = 2, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 0, Id = 3, EventId = 2 });
                context.SaveChanges();
                Assert.Equal(3, context.Notifications.Count());
                Assert.False(context.Notifications.Where(n => n.Id == 1).Single().IsDismissed);

                var result = await controller.RejectNotification(1);

                // Assert
                result.Should().BeOfType<UnauthorizedResult>();
            }
        }

        [Fact]
        public async void can_send_invite_notification()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "NotificationTest7").Options;
            string userId = "1";

            using (var context = new DatabaseContext(options))
            {
                // Act
                var controller = new NotificationsController(context);
                AddUserClaim(controller, userId);
                context.Users.Add(new User() { FacebookId = userId });
                context.Events.Add(new Event() { Id = 2, OwnerId = "1" });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 1, Id = 1, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 2, Id = 2, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 1, Id = 3, EventId = 2 });
                context.SaveChanges();
                Assert.Equal(3, context.Notifications.Count());
                Assert.False(context.Notifications.Where(n => n.Id == 1).Single().IsDismissed);

                await controller.SendInviteNotification(2, "2");

                // Assert
                Assert.Equal(4, context.Notifications.Count());
                Assert.True(context.Notifications.Any(n => n.MessageType == 0 && n.ReceiverId == "2" && n.EventId == 2));
            }
        }

        [Fact]
        public async void sending_invitation_to_not_ownered_event_should_return_unauthorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "NotificationTest4").Options;
            string userId = "1";

            using (var context = new DatabaseContext(options))
            {
                // Act
                var controller = new NotificationsController(context);
                AddUserClaim(controller, userId);
                context.Users.Add(new User() { FacebookId = userId });
                context.Events.Add(new Event() { Id = 2, OwnerId = "2" });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 1, Id = 1, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 2, Id = 2, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 1, Id = 3, EventId = 2 });
                context.SaveChanges();
                Assert.Equal(3, context.Notifications.Count());
                Assert.False(context.Notifications.Where(n => n.Id == 1).Single().IsDismissed);

                var result = await controller.SendInviteNotification(2, "2");

                result.Should().BeOfType<UnauthorizedResult>();
            }
        }

        [Fact]
        public async void sending_invitation_to_not_existing_event_should_return_badRequest()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "NotificationTest5").Options;
            string userId = "1";

            using (var context = new DatabaseContext(options))
            {
                // Act
                var controller = new NotificationsController(context);
                AddUserClaim(controller, userId);
                context.Users.Add(new User() { FacebookId = userId });
                context.Events.Add(new Event() { Id = 1, OwnerId = "1" });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 1, Id = 1, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 2, Id = 2, EventId = 1 });
                context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 1, Id = 3, EventId = 2 });
                context.SaveChanges();
                Assert.Equal(3, context.Notifications.Count());
                Assert.False(context.Notifications.Where(n => n.Id == 1).Single().IsDismissed);

                var result = await controller.SendInviteNotification(2, "2");

                result.Should().BeOfType<BadRequestResult>();
            }
        }
    }
}
