using HabitTracker.DTOs;

namespace HabitTracker.Services
{
    public interface IGoalService
    {
        Task<IReadOnlyCollection<SavingsGoalResponse>> GetGoalsAsync(int userId);
        Task<SavingsGoalResponse> CreateGoalAsync(CreateSavingsGoalRequest request, int userId);
        Task<SavingsGoalResponse?> UpdateGoalAsync(int id, UpdateSavingsGoalRequest request, int userId);
        Task<SavingsGoalResponse?> ActivateGoalAsync(int id, int userId);
        Task<bool> DeleteGoalAsync(int id, int userId);
    }
}
