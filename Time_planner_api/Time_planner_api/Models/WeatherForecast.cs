using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Time_planner_api.Models
{
    public class WeatherForecast
    {

        [Key]
        [Required]
        [Column(TypeName = "varchar(50)")]
        public DateTime Date { get; set; }

        [Required]
        [Column(TypeName = "int")]
        public int TemperatureC { get; set; }

        [Required]
        [Column(TypeName = "int")]
        public int TemperatureF { get; set; }

        [Required]
        [Column(TypeName = "varchar(50)")]
        public string Summary { get; set; }
    }
}
