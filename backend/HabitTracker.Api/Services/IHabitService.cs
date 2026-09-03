using HabitTracker.DTOs;

namespace HabitTracker.Services
{
    public interface IHabitService
    {
        Task<IEnumerable<HabitResponse>> GetUserHabitsAsync(int userId);
        Task<HabitResponse?> GetHabitByIdAsync(int id, int userId);
        Task<HabitResponse> CreateHabitAsync(CreateHabitRequest request, int userId);
        Task<HabitResponse?> UpdateHabitAsync(int id, UpdateHabitRequest request, int userId);
        Task<bool> DeleteHabitAsync(int id, int userId);
        Task<bool> ToggleHabitLogAsync(int habitId, int userId, DateTime? date);
        Task<IEnumerable<HabitLogResponse>> GetHabitLogsAsync(int habitId, int userId);
        Task<IEnumerable<WeeklyProgressResponse>> GetWeeklyProgressAsync(int userId);
    }
}
