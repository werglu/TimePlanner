using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        public List<Notification> Notifications { get; set; }

        public bool IsPublic { get; set; }

        public string City { get; set; }

        public string StreetAddress { get; set; }

        public string OwnerId { get; set; }

        public User Owner { get; set; }

        [Column(TypeName = "varchar(1000)")]
        public string Description { get; set; }

        public double Longitude { get; set; }

        public double Latitude { get; set; }
    }
}
