using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Time_planner_api.Models
{
    public class CalendarItem
    {
        public Event E { get; set; }
        public Task T { get; set; }
        public bool Assigned { get; set; }
    }
}
