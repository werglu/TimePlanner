using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Time_planner_api.Models
{
    public class CommonDateOutput
    {
        public string[] ConflictingUsers { get; set; }
        public DateTime CommonDate { get; set; }
    }
}
