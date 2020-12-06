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

        public string City { get; set; }

        public string StreetAddress { get; set; }

        public DateTime? Date0 { get; set; }
        public DateTime? Date1 { get; set; }
        public DateTime? Date2 { get; set; }
        public DateTime? Date3 { get; set; }
        public DateTime? Date4 { get; set; }
        public DateTime? Date5 { get; set; }
        public DateTime? Date6 { get; set; }

        public int? Days { get; set; }
        public int? Time { get; set; }
        public int? Split { get; set; }

        [NotMapped]
        public double? Longitude
        {
            get
            {
                // todo: to be changed when we will have address in db and access to api for getting location
                double rand = Title[0] % 2 == 1 ? ((double)Id * (double)Title[0] - (double)Title[0] * (double)Title[0]) / 1000.0 :
                    ((double)Id * (double)Title[0] - (double)Title[0] * (double)Title[0]) / 1000.0;
                rand /= (double)Id;
                rand *= 5;
                return rand - (int)rand;
            }
        }

        [NotMapped]
        public double? Latitude
        {
            get
            {
                // todo: to be changed when we will have address in db and access to api for getting location
                double rand = Title[0] % 2 == 1 ? ((double)(100 - Id) * (double)Title[0] * 10 - (double)Title[0] * (double)Id) / 10000.0 :
                    ((double)(100 - Id) * (double)Title[0] - (double)Id * (double)Title[0] * 10) / 10000.0;
                rand /= (double)Title[0];
                rand *= 7;
                return rand - (int)rand;
            }
        }
    }
}
