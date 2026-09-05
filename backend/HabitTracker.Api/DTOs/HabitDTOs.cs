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

        [Range(typeof(decimal), "0", "10000000")]
        public decimal? MoneySavedPerCompletion { get; set; }

        [Range(0, 10080)]
        public int? MinutesSavedPerCompletion { get; set; }

        [Range(0, 10080)]
        public int? MinutesInvestedPerCompletion { get; set; }
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

        [Range(typeof(decimal), "0", "10000000")]
        public decimal? MoneySavedPerCompletion { get; set; }

        [Range(0, 10080)]
        public int? MinutesSavedPerCompletion { get; set; }

        [Range(0, 10080)]
        public int? MinutesInvestedPerCompletion { get; set; }
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

        public decimal MoneySavedPerCompletion { get; set; }
        public int MinutesSavedPerCompletion { get; set; }
        public int MinutesInvestedPerCompletion { get; set; }
        public int TotalCompletions { get; set; }
        public decimal TotalMoneySaved { get; set; }
        public int TotalMinutesSaved { get; set; }
        public int TotalMinutesInvested { get; set; }
    }

    public class ImpactSummaryResponse
    {
        public decimal TotalMoneySaved { get; set; }
        public int TotalMinutesSaved { get; set; }
        public int TotalMinutesInvested { get; set; }
        public int TotalSuccessfulCompletions { get; set; }
        public decimal MoneySavedLast30Days { get; set; }
        public int MinutesSavedLast30Days { get; set; }
        public int MinutesInvestedLast30Days { get; set; }
        public int ImpactHabitCount { get; set; }
    }


    public class TimeBankResponse
    {
        public int TotalMinutesRecovered { get; set; }
        public int MinutesRecoveredLast30Days { get; set; }
        public int MinutesRecoveredLast7Days { get; set; }
        public string? TopSourceTitle { get; set; }
        public int TopSourceMinutes { get; set; }
        public int ImpactHabitCount { get; set; }
    }

    public class FutureProjectionPeriod
    {
        public int Days { get; set; }
        public string Label { get; set; } = string.Empty;
        public decimal ProjectedMoneySaved { get; set; }
        public int ProjectedMinutesRecovered { get; set; }
        public int ProjectedMinutesInvested { get; set; }
    }

    public class FutureMeProjectionResponse
    {
        public int PaceWindowDays { get; set; }
        public decimal MoneySavedPerDay { get; set; }
        public double MinutesRecoveredPerDay { get; set; }
        public double MinutesInvestedPerDay { get; set; }
        public int ImpactHabitCount { get; set; }
        public List<FutureProjectionPeriod> Periods { get; set; } = new();
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
