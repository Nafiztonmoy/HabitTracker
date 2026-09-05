using HabitTracker.Data;
using HabitTracker.DTOs;
using HabitTracker.Models;
using Microsoft.EntityFrameworkCore;

namespace HabitTracker.Services
{
    public class GoalService : IGoalService
    {
        private readonly ApplicationDbContext _context;

        public GoalService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyCollection<SavingsGoalResponse>> GetGoalsAsync(int userId)
        {
            var totalSavings = await CalculateTotalHabitSavingsAsync(userId);
            var goals = await _context.SavingsGoals
                .Where(goal => goal.UserId == userId)
                .OrderByDescending(goal => goal.IsActive)
                .ThenByDescending(goal => goal.CreatedAt)
                .ToListAsync();

            return goals.Select(goal => MapToResponse(goal, totalSavings)).ToList();
        }

        public async Task<SavingsGoalResponse> CreateGoalAsync(CreateSavingsGoalRequest request, int userId)
        {
            var totalSavings = await CalculateTotalHabitSavingsAsync(userId);

            if (request.MakeActive)
            {
                await FinalizeActiveGoalsAsync(userId, totalSavings);
            }

            var goal = new SavingsGoal
            {
                UserId = userId,
                Name = request.Name.Trim(),
                TargetAmount = decimal.Round(request.TargetAmount, 2),
                StartingAmount = decimal.Round(request.StartingAmount, 2),
                AccumulatedHabitSavings = 0m,
                SavingsBaselineAtActivation = totalSavings,
                IsActive = request.MakeActive,
                TargetDate = request.TargetDate?.Date
            };

            _context.SavingsGoals.Add(goal);
            await _context.SaveChangesAsync();

            return MapToResponse(goal, totalSavings);
        }

        public async Task<SavingsGoalResponse?> UpdateGoalAsync(int id, UpdateSavingsGoalRequest request, int userId)
        {
            var goal = await _context.SavingsGoals
                .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);

            if (goal == null) return null;

            goal.Name = request.Name.Trim();
            goal.TargetAmount = decimal.Round(request.TargetAmount, 2);
            goal.StartingAmount = decimal.Round(request.StartingAmount, 2);
            goal.TargetDate = request.TargetDate?.Date;

            await _context.SaveChangesAsync();
            var totalSavings = await CalculateTotalHabitSavingsAsync(userId);
            return MapToResponse(goal, totalSavings);
        }

        public async Task<SavingsGoalResponse?> ActivateGoalAsync(int id, int userId)
        {
            var targetGoal = await _context.SavingsGoals
                .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);

            if (targetGoal == null) return null;

            var totalSavings = await CalculateTotalHabitSavingsAsync(userId);

            if (!targetGoal.IsActive)
            {
                await FinalizeActiveGoalsAsync(userId, totalSavings, id);
                targetGoal.IsActive = true;
                targetGoal.SavingsBaselineAtActivation = totalSavings;
                await _context.SaveChangesAsync();
            }

            return MapToResponse(targetGoal, totalSavings);
        }

        public async Task<bool> DeleteGoalAsync(int id, int userId)
        {
            var goal = await _context.SavingsGoals
                .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);

            if (goal == null) return false;

            _context.SavingsGoals.Remove(goal);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task FinalizeActiveGoalsAsync(int userId, decimal totalSavings, int? exceptGoalId = null)
        {
            var activeGoals = await _context.SavingsGoals
                .Where(goal => goal.UserId == userId && goal.IsActive && (!exceptGoalId.HasValue || goal.Id != exceptGoalId.Value))
                .ToListAsync();

            foreach (var goal in activeGoals)
            {
                var liveContribution = Math.Max(0m, totalSavings - goal.SavingsBaselineAtActivation);
                goal.AccumulatedHabitSavings = decimal.Round(goal.AccumulatedHabitSavings + liveContribution, 2);
                goal.SavingsBaselineAtActivation = totalSavings;
                goal.IsActive = false;
            }
        }

        private async Task<decimal> CalculateTotalHabitSavingsAsync(int userId)
        {
            var habits = await _context.Habits
                .Where(habit => habit.UserId == userId && habit.MoneySavedPerCompletion > 0)
                .Select(habit => new
                {
                    habit.MoneySavedPerCompletion,
                    CompletedCount = habit.HabitLogs.Count(log => log.Completed)
                })
                .ToListAsync();

            return decimal.Round(
                habits.Sum(item => item.MoneySavedPerCompletion * item.CompletedCount),
                2);
        }

        private static SavingsGoalResponse MapToResponse(SavingsGoal goal, decimal totalSavings)
        {
            var liveContribution = goal.IsActive
                ? Math.Max(0m, totalSavings - goal.SavingsBaselineAtActivation)
                : 0m;

            var habitSavingsApplied = decimal.Round(goal.AccumulatedHabitSavings + liveContribution, 2);
            var currentAmount = decimal.Round(goal.StartingAmount + habitSavingsApplied, 2);
            var remaining = Math.Max(0m, decimal.Round(goal.TargetAmount - currentAmount, 2));
            var percentage = goal.TargetAmount <= 0
                ? 0
                : Math.Min(100d, (double)(currentAmount / goal.TargetAmount * 100m));

            return new SavingsGoalResponse
            {
                Id = goal.Id,
                Name = goal.Name,
                TargetAmount = goal.TargetAmount,
                StartingAmount = goal.StartingAmount,
                HabitSavingsApplied = habitSavingsApplied,
                CurrentAmount = currentAmount,
                RemainingAmount = remaining,
                ProgressPercentage = Math.Round(percentage, 1),
                IsActive = goal.IsActive,
                IsComplete = currentAmount >= goal.TargetAmount,
                CreatedAt = goal.CreatedAt,
                TargetDate = goal.TargetDate
            };
        }
    }
}
