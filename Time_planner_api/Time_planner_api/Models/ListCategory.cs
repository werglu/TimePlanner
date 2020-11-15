using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Time_planner_api.Models
{
    public class ListCategory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Category { get; set; }

        public string OwnerId { get; set; }

        public User Owner { get; set; }

        public List<Task> Tasks { get; set; }

    }
}
