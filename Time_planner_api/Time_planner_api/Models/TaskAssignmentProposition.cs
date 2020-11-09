using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Time_planner_api.Models
{
    public class TaskAssignmentProposition
    {
        public class Interval
        {
            public DateTime Start { get; set; }
            public DateTime End { get; set; }
        }
        public Task Task { get; set; }
        public Interval[] DayTimes { get; set; }
    }
}
