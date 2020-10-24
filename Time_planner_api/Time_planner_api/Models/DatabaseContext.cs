using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Time_planner_api.Models
{
    public class DatabaseContext : DbContext
    {
        public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options)
        { }

        public DbSet<WeatherForecast> WeatherForecasts { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<ListCategory> ListCategories { get; set; }
        public DbSet<Task> Tasks { get; set; }

    }
}
