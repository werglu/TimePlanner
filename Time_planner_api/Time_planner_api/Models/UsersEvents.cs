using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Time_planner_api.Models
{
    public class UsersEvents
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int EventId { get; set; }

        public string UserId { get; set; }

        public int Status { get; set; } // 0-unknown, 1 - accepted. 2 - rejected

    }

}
