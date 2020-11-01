using System;
using System.Collections.Generic;
using System.Linq;

namespace Time_planner_api.Models
{
    public class TaskAssignmentProposition
    {
        public Task Task { get; set; }
        public double[] DayTimes { get; set; }
    }
}
