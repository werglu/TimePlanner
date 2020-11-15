using System.ComponentModel.DataAnnotations;

namespace Time_planner_api.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MessageType { get; set; }

        public int? EventId { get; set; }

        public Event Event { get; set; }

        public string ReceiverId { get; set; }

        public User Receiver { get; set; }

        public bool IsDismissed { get; set; }
    }
}
