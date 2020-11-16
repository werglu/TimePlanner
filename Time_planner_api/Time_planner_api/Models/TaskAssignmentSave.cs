using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Time_planner_api.Models
{
    public class TaskAssignmentSave
    {
        public int TaskId { get; set; }
        public bool[] DayTimes { get; set; }
    }
}
