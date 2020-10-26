using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Time_planner_api.Models
{
    public class Event
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Column(TypeName = "varchar(50)")]
        public string Title { get; set; }

        [NotMapped]
        public double Longitude
        {
            get
            {
                // todo: to be changed when we will have address in db and access to api for getting location
                double rand = StartDate.Day % 2 == 1 ? ((double)Id * (double)EndDate.Day - (double)StartDate.Day * (double)EndDate.Month) / 1000.0 :
                    ((double)Id * (double)StartDate.Month - (double)EndDate.Month * (double)StartDate.Day) / 1000.0;
                rand /= (double)Id;
                rand *= 5;
                return rand - (int)rand;
            }
        }

        [NotMapped]
        public double Latitude
        {
            get
            {
                // todo: to be changed when we will have address in db and access to api for getting location
                double rand = EndDate.Month % 2 == 1 ? ((double)(100 - Id) * (double)EndDate.Year - (double)StartDate.Day * (double)Id) / 10000.0 :
                    ((double)(100 - Id) * (double)StartDate.Month - (double)Id * (double)StartDate.Year) / 10000.0;
                rand /= (double)EndDate.Day;
                rand *= 7;
                return rand - (int)rand;
            }
        }
    }
}
