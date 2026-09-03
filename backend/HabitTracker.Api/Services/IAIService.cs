using HabitTracker.DTOs;

namespace HabitTracker.Services
{
    public interface IAIService
    {
        bool IsConfigured { get; }
        string Provider { get; }
        string Model { get; }

        Task<SmartHabitSuggestionResponse> SuggestHabitAsync(
            SmartHabitSuggestionRequest request,
            IReadOnlyCollection<HabitResponse> existingHabits,
            CancellationToken cancellationToken = default);

        Task<WeeklyAIReviewResponse> GenerateWeeklyReviewAsync(
            IReadOnlyCollection<HabitResponse> habits,
            IReadOnlyCollection<WeeklyProgressResponse> weeklyProgress,
            CancellationToken cancellationToken = default);
    }
}
