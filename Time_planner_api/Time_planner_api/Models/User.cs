﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Time_planner_api.Models
{
    public class User
    {
        [Key]
        public string FacebookId { get; set; }
        public int Theme { get; set; }

        public List<Event> AttendedEvents { get; set; }

        public List<ListCategory> OwnedTaskCategories { get; set; }

        public List<Notification> Notifications { get; set; }
    }
}
