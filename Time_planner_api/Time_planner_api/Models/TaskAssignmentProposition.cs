using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Time_planner_api.Models
{
    public class TaskAssignmentProposition
    {
        public Task Task { get; set; }
        public (DateTime, DateTime)[] DayTimes { get; set; }
    }
}
