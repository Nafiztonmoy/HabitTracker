using System.ComponentModel.DataAnnotations;
using HabitTracker.Models;

namespace HabitTracker.DTOs
{
    public class CreateHabitRequest
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public TargetType TargetType { get; set; } = TargetType.Daily;

        [MaxLength(50)]
        public string? Color { get; set; }
    }

    public class UpdateHabitRequest
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public TargetType TargetType { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }
    }

    public class HabitResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public TargetType TargetType { get; set; }
        public string Icon { get; set; } = "🎯";
        public string Color { get; set; } = "purple";
        public int CurrentStreak { get; set; }
        public int BestStreak { get; set; }
        public double CompletionPercentage { get; set; }
        public bool IsCompletedToday { get; set; }
        public List<CalendarDay> CalendarDays { get; set; } = new();
    }

    public class CalendarDay
    {
        public string Date { get; set; } = string.Empty;
        public bool Completed { get; set; }
    }

    public class LogRequest
    {
        [Required]
        public int HabitId { get; set; }
        public DateTime? Date { get; set; }
        public bool Completed { get; set; } = true;
    }

    public class HabitLogResponse
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public bool Completed { get; set; }
    }

    public class WeeklyProgressResponse
    {
        public string Day { get; set; } = string.Empty;
        public int Completed { get; set; }
        public int Total { get; set; }
    }
}