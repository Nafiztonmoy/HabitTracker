using System.ComponentModel.DataAnnotations;

namespace HabitTracker.DTOs
{
    public class SmartHabitSuggestionRequest
    {
        [Required, MinLength(3), MaxLength(500)]
        public string Goal { get; set; } = string.Empty;
    }

    public class SmartHabitSuggestionResponse
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TargetType { get; set; } = "Daily";
        public string Color { get; set; } = "indigo";
        public string Reason { get; set; } = string.Empty;
    }

    public class WeeklyAIReviewResponse
    {
        public string Headline { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Win { get; set; } = string.Empty;
        public string Watch { get; set; } = string.Empty;
        public string NextAction { get; set; } = string.Empty;
    }


    public class FutureMeAIResponse
    {
        public string Headline { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string BestLever { get; set; } = string.Empty;
        public string NextAction { get; set; } = string.Empty;
    }

    public class AIStatusResponse
    {
        public bool Configured { get; set; }
        public string Provider { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
    }
}