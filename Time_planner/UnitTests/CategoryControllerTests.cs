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
    public class CategoryControllerTests : TestsBase
    {
        [Fact]
        public async void CanGetAllCategories()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "CategoryTest").Options;
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
                Assert.Equal(1, ((ListCategory)value[0]).Id);
            }
        }
    }
}
