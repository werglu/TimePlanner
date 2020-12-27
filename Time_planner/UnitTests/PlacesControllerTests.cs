using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;

namespace UnitTests
{
    public class PlacesControllerTests : TestsBase
    {
        [Fact]
        public async void GetUsersPlaces_returnsAllPlaces()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "GetUsersPlacesTest").Options;

            using (var context = new DatabaseContext(options))
            {
                // Arrange
                string ownerId = "1";
                var controller = new PlacesController(context);
                AddUserClaim(controller, ownerId);
                context.Users.Add(new User() { FacebookId = ownerId });

                // Act
                context.Places.Add(new Place()
                {
                    Id = 1,
                    Name = "Place1",
                    City = "Warsaw",
                    StreetAddress = "Słoneczna 1/5",
                    OwnerId = ownerId,
                });
                context.Places.Add(new Place()
                {
                    Id = 2,
                    Name = "Place2",
                    City = "Warsaw",
                    StreetAddress = "Słoneczna 1/5",
                    OwnerId = ownerId,
                });
                context.Places.Add(new Place()
                {
                    Id = 3,
                    Name = "Place3",
                    City = "Warsaw",
                    StreetAddress = "Słoneczna 1/5",
                    OwnerId = ownerId,
                });
                context.SaveChanges();
                var result = await controller.Get();

                // Assert
                var resultCount = result.Value.Count();
                var expectedCount = 3;
                Assert.Equal(expectedCount, resultCount);
            }
        }

        [Fact]
        public async void GetUsersPlaces_returnsNotFoundWhenUserDoesntExist()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "GetUsersPlacesTest2").Options;

            using (var context = new DatabaseContext(options))
            {
                // Arrange
                string ownerId = "1";
                var controller = new PlacesController(context);
                AddUserClaim(controller, ownerId);

                // Act
                context.Places.Add(new Place()
                {
                    Id = 1,
                    Name = "Place1",
                    City = "Warsaw",
                    StreetAddress = "Słoneczna 1/5",
                    OwnerId = ownerId,
                });
                context.SaveChanges();
                var result = await controller.Get();

                // Assert
                Assert.IsType<NotFoundResult>(result.Result);
            }
        }

        [Fact]
        public async void PostPlace_addsPlaceAndReturnsOk()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "PostPlaceTest").Options;

            using (var context = new DatabaseContext(options))
            {
                // Arrange
                string ownerId = "1";
                var controller = new PlacesController(context);
                AddUserClaim(controller, ownerId);
                var place = new Place()
                {
                    Name = "Place1",
                    City = "Warsaw",
                    StreetAddress = "Słoneczna 1/5",
                    OwnerId = ownerId,
                };
                var place2 = new Place()
                {
                    Name = "Place2",
                    City = "Warsaw",
                    StreetAddress = "Słoneczna 1/5",
                    OwnerId = ownerId,
                };

                // Act
                context.Users.Add(new User() { FacebookId = ownerId });
                context.SaveChanges();

                var result = await controller.PostPlace(place);
                var result2 = await controller.PostPlace(place2);

                // Assert
                Assert.IsType<OkResult>(result);
                Assert.IsType<OkResult>(result2);

                var places = await controller.Get();
                var placesCount = places.Value.Count();
                var expectedCount = 2;
                Assert.Equal(expectedCount, placesCount);
            }
        }

        [Fact]
        public async void PostPlace_doesntaddPlaceAndReturnsNotFoundWhenUserDoesntExist()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "PostPlaceTest2").Options;

            using (var context = new DatabaseContext(options))
            {
                // Arrange
                string ownerId = "1";
                var controller = new PlacesController(context);
                AddUserClaim(controller, ownerId);
                var place = new Place()
                {
                    Name = "Place1",
                    City = "Warsaw",
                    StreetAddress = "Słoneczna 1/5",
                    OwnerId = ownerId,
                };
                var place2 = new Place()
                {
                    Name = "Place2",
                    City = "Warsaw",
                    StreetAddress = "Słoneczna 1/5",
                    OwnerId = ownerId,
                };

                // Act
                var result = await controller.PostPlace(place);
                var result2 = await controller.PostPlace(place2);

                // Assert
                Assert.IsType<NotFoundResult>(result);
                Assert.IsType<NotFoundResult>(result2);
            }
        }

        [Fact]
        public async void DeletePlace_ReturnsDeletedPlace()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "DeletePlaceTest").Options;

            using (var context = new DatabaseContext(options))
            {
                // Arrange
                int placeId = 1;
                string ownerId = "1";
                var place = new Place()
                {
                    Id = placeId,
                    Name = "Place1",
                    City = "Warsaw",
                    StreetAddress = "Słoneczna 1/5",
                    OwnerId = ownerId,
                };
                context.Places.Add(place);
                context.SaveChanges();

                // Act 
                context.Users.Add(new User() { FacebookId = ownerId });
                context.SaveChanges();

                var controller = new PlacesController(context);
                AddUserClaim(controller, ownerId);
                var result = await controller.DeletePlace(place.Id);

                // Assert
                Assert.IsType<Place>(result.Value);

                var resultPlaceId = result.Value.Id;
                Assert.Equal(placeId, resultPlaceId);

                var places = await controller.Get();
                var endCount = places.Value.Count();
                var expectedCount = 0;
                Assert.Equal(expectedCount, endCount);
            }
        }

        [Fact]
        public async void DeletePlace_ReturnsNotFoundWhenPlaceDoesntExist()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "DeletePlaceTest2").Options;

            using (var context = new DatabaseContext(options))
            {
                // Arrange
                int placeId = 1;
                string ownerId = "1";

                // Act 
                context.Users.Add(new User() { FacebookId = ownerId });
                context.SaveChanges();

                var controller = new PlacesController(context);
                AddUserClaim(controller, ownerId);
                var result = await controller.DeletePlace(placeId);

                // Assert
                Assert.IsType<NotFoundResult>(result.Result);
            }
        }
    }
}
