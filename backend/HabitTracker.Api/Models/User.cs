using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<Habit> Habits { get; set; } = new List<Habit>();
        public ICollection<ExternalLogin> ExternalLogins { get; set; } = new List<ExternalLogin>();
        public ICollection<SavingsGoal> SavingsGoals { get; set; } = new List<SavingsGoal>();
    }
}