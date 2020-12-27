using Microsoft.EntityFrameworkCore;
using System.Linq;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;

namespace UnitTests
{
    public class NotificationsControllerTests : TestsBase
    {
        [Fact]
        public async void get_notifications_should_return_all_notifications_per_user()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;
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
                Assert.Equal(notificationsCount, 1);
            }
        }

        //[Fact]
        //public async void get_notification_should_return_this_notification()
        //{
        //    var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

        //    using (var context = new DatabaseContext(options))
        //    {
        //        // Act
        //        var controller = new NotificationsController(context);
        //        context.Users.Add(new User() { FacebookId = "1" });
        //        context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 1, Id = 1 });
        //        context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 1, Id = 2 });
        //        context.SaveChanges();
        //        var notifications = await controller.GetNotification("1", 1);

        //        // Assert
        //        Assert.Equal(notifications.Value.Id, 1);
        //    }
        //}


        //[Fact]
        //public async void can_delete_all_notification_with_specified_event_id()
        //{
        //    var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

        //    using (var context = new DatabaseContext(options))
        //    {
        //        // Act
        //        var controller = new NotificationsController(context);
        //        context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 1, Id = 1, EventId = 1 });
        //        context.Notifications.Add(new Notification() { ReceiverId = "1", MessageType = 1, Id = 2, EventId = 1 });
        //        context.Notifications.Add(new Notification() { ReceiverId = "2", MessageType = 1, Id = 3, EventId = 2 });
        //        context.SaveChanges();
        //        Assert.Equal(context.Notifications.Count(), 3);

        //        await controller.DeleteAllNotificationsWithSpecifiedEventId(1);

        //        // Assert
        //        Assert.Equal(context.Notifications.Count(), 1);
        //    }
        //}
    }
}
