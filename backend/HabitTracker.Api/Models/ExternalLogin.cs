using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Models
{
    public class ExternalLogin
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required, MaxLength(50)]
        public string Provider { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string ProviderUserId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
    }
}
