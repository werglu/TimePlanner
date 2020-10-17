using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Time_planner.Models
{
    public class Event
    {
        public int Id { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string Title { get; set; }
    }
}
