using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Time_planner.Models;

namespace Time_planner.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class EventController : Controller
    {
        private static readonly string[] Titles = new[]
        {
            "Disco", "Private appointment", "Work", "Lecture", "Shopping"
        };

        private readonly ILogger<EventController> _logger;

        public EventController(ILogger<EventController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IEnumerable<Event> Get()
        {
            var rng = new Random();
            return Enumerable.Range(1, 5).Select(index => new Event
            { 
                Id = index,
                StartDate = DateTime.Now.AddDays(index),
                EndDate = DateTime.Now.AddDays(index),
                Title = Titles[rng.Next(Titles.Length)]
            })
            .ToArray();
        }
    }
}