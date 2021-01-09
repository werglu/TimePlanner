﻿using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Time_planner_api.Models
{
    public class CommonDateInput
    {
        public string[] UserIds { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public int ExcludeEventId { get; set; }
    }
}
