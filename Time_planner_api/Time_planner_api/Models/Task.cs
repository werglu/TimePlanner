using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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

    }
}
