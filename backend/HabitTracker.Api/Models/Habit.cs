using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Models
{
    public enum TargetType
    {
        Daily,
        Weekly
    }

    public class Habit
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public TargetType TargetType { get; set; } = TargetType.Daily;

        [MaxLength(50)]
        public string Icon { get; set; } = "🎯";

        [MaxLength(50)]
        public string Color { get; set; } = "purple";

        // LIFE ROI values are user estimates applied once per completed HabitLog.
        // Zero keeps existing habits fully backward-compatible.
        public decimal MoneySavedPerCompletion { get; set; }
        public int MinutesSavedPerCompletion { get; set; }
        public int MinutesInvestedPerCompletion { get; set; }

        public User User { get; set; } = null!;
        public ICollection<HabitLog> HabitLogs { get; set; } = new List<HabitLog>();
    }
}
