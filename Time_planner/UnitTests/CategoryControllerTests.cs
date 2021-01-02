using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using Time_planner_api.Controllers;
using Time_planner_api.Models;
using Xunit;

namespace UnitTests
{
    public class CategoryControllerTests : TestsBase
    {
        [Fact]
        public async void can_get_all_categories()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "CategoryTest1").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = userId });
                context.SaveChanges();
                var controller = new ListCategoriesController(context);
                AddUserClaim(controller, userId);
                var result = await controller.GetCategories();
                var count = result.Value.Count();
                var value = result.Value.ToArray();
                Assert.Equal(1, count);
                Assert.Equal(1, (value[0]).Id);
            }
        }

        [Fact]
        public async void can_add_category()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "CategoryTest2").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = userId });
                context.SaveChanges();
                var controller = new ListCategoriesController(context);
                AddUserClaim(controller, userId);

                var result = await controller.PostCategory(new ListCategory() { Id = 2, OwnerId = userId, Category = "newCategory" });
         
                Assert.Equal(2, context.ListCategories.Count());
                Assert.True(context.ListCategories.Any(lc => lc.Category == "newCategory"));
            }
        }

        [Fact]
        public async void add_category_to_other_user_should_return_unauthorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "CategoryTest3").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = userId });
                context.SaveChanges();
                var controller = new ListCategoriesController(context);
                AddUserClaim(controller, userId);

                var result = await controller.PostCategory(new ListCategory() { Id = 2, OwnerId = "2", Category = "newCategory" });

                result.Result.Should().BeOfType<UnauthorizedResult>();
            }
        }

        [Fact]
        public async void can_edit_category()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "CategoryTest4").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = userId, Category = "Category" });
                context.SaveChanges();
                var controller = new ListCategoriesController(context);
                AddUserClaim(controller, userId);

                var result = await controller.PutCategory(1, new ListCategory() { Id = 1, OwnerId = userId, Category = "editedCategory" });

                Assert.Equal(1, context.ListCategories.Count());
                Assert.True(context.ListCategories.Any(lc => lc.Category == "editedCategory"));
            }
        }

        [Fact]
        public async void edit_category_not_owned_should_return_unauthorized()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "CategoryTest5").Options;
            var userId = "1";

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = userId, Category = "Category" });
                context.SaveChanges();
                var controller = new ListCategoriesController(context);
                AddUserClaim(controller, userId);

                var result = await controller.PutCategory(1, new ListCategory() { Id = 1, OwnerId = "2", Category = "editedCategory" });

                result.Should().BeOfType<UnauthorizedResult>();
            }
        }
    }
}
