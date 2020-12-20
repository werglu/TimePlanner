using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Time_planner_api.Models
{
    public class EventWithFriends
    {
        public Event Event { get; set; }
        public string[] FriendIds { get; set; }
    }
}
