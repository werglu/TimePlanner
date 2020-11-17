﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Time_planner_api.Models
{
    public class Task
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public bool IsDone { get; set; }
        public int CategoryId { get; set; }
        public ListCategory Category { get; set; }

        public int Priority { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [NotMapped]
        public DateTime? Date0 { get; set; }
        [NotMapped]
        public DateTime? Date1 { get; set; }
        [NotMapped]
        public DateTime? Date2 { get; set; }
        [NotMapped]
        public DateTime? Date3 { get; set; }
        [NotMapped]
        public DateTime? Date4 { get; set; }
        [NotMapped]
        public DateTime? Date5 { get; set; }
        [NotMapped]
        public DateTime? Date6 { get; set; }

        [NotMapped]
        public int? Days { get; set; }
        [NotMapped]
        public int? Time { get; set; }
        [NotMapped]
        public int? Split { get; set; }
    }
}
