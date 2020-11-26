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
    public class CategoryControllerTests
    {
        [Fact]
        public async void CanGetAllCategories()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>().UseInMemoryDatabase(databaseName: "Test").Options;

            using (var context = new DatabaseContext(options))
            {
                context.ListCategories.Add(new ListCategory() { Id = 1, OwnerId = "1" });
                context.SaveChanges();
                var controller = new ListCategoriesController(context);
                var result = await controller.GetCategories();
                var count = result.Value.Count();
                var value = result.Value.ToArray();
                Assert.Equal(1, count);
                Assert.Equal(1, ((ListCategory)value[0]).Id);
            }
        }
    }
}
