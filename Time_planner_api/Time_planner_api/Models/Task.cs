using System;
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
        public int Days { get { return 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 - 1; } }
        [NotMapped]
        public double Time { get { return 0.3; } }
        [NotMapped]
        public int Split { get { return 2; } }
    }
}
