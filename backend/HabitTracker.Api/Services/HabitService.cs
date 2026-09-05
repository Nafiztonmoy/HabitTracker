using HabitTracker.Data;
using HabitTracker.DTOs;
using HabitTracker.Models;
using Microsoft.EntityFrameworkCore;

namespace HabitTracker.Services
{
    public class HabitService : IHabitService
    {
        private readonly ApplicationDbContext _context;

        public HabitService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HabitResponse>> GetUserHabitsAsync(int userId)
        {
            var habits = await _context.Habits
                .Where(h => h.UserId == userId)
                .Include(h => h.HabitLogs)
                .ToListAsync();

            return habits.Select(MapToResponse);
        }

        public async Task<HabitResponse?> GetHabitByIdAsync(int id, int userId)
        {
            var habit = await _context.Habits
                .Include(h => h.HabitLogs)
                .FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

            return habit == null ? null : MapToResponse(habit);
        }

        public async Task<HabitResponse> CreateHabitAsync(CreateHabitRequest request, int userId)
        {
            var (icon, generatedColor) = GetIconAndColor(request.Title);
            var color = NormalizeColor(request.Color) ?? generatedColor;

            var habit = new Habit
            {
                UserId = userId,
                Title = request.Title.Trim(),
                Description = request.Description?.Trim(),
                TargetType = request.TargetType,
                Icon = icon,
                Color = color,
                MoneySavedPerCompletion = request.MoneySavedPerCompletion ?? 0m,
                MinutesSavedPerCompletion = request.MinutesSavedPerCompletion ?? 0,
                MinutesInvestedPerCompletion = request.MinutesInvestedPerCompletion ?? 0
            };

            _context.Habits.Add(habit);
            await _context.SaveChangesAsync();

            return MapToResponse(habit);
        }

        public async Task<HabitResponse?> UpdateHabitAsync(int id, UpdateHabitRequest request, int userId)
        {
            var habit = await _context.Habits
                .Include(h => h.HabitLogs)
                .FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

            if (habit == null) return null;

            var (icon, generatedColor) = GetIconAndColor(request.Title);
            var color = NormalizeColor(request.Color) ?? generatedColor;

            habit.Title = request.Title.Trim();
            habit.Description = request.Description?.Trim();
            habit.TargetType = request.TargetType;
            habit.Icon = icon;
            habit.Color = color;

            // Nullable request properties let older clients update a habit without
            // unintentionally clearing LIFE ROI values they do not know about.
            if (request.MoneySavedPerCompletion.HasValue)
                habit.MoneySavedPerCompletion = request.MoneySavedPerCompletion.Value;
            if (request.MinutesSavedPerCompletion.HasValue)
                habit.MinutesSavedPerCompletion = request.MinutesSavedPerCompletion.Value;
            if (request.MinutesInvestedPerCompletion.HasValue)
                habit.MinutesInvestedPerCompletion = request.MinutesInvestedPerCompletion.Value;

            await _context.SaveChangesAsync();
            return MapToResponse(habit);
        }

        public async Task<bool> DeleteHabitAsync(int id, int userId)
        {
            var habit = await _context.Habits
                .FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

            if (habit == null) return false;

            _context.Habits.Remove(habit);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleHabitLogAsync(int habitId, int userId, DateTime? date)
        {
            var habit = await _context.Habits
                .FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);

            if (habit == null) return false;

            var targetDate = date?.Date ?? DateTime.UtcNow.Date;

            var existingLog = await _context.HabitLogs
                .FirstOrDefaultAsync(l => l.HabitId == habitId && l.Date.Date == targetDate);

            if (existingLog != null)
            {
                existingLog.Completed = !existingLog.Completed;
            }
            else
            {
                _context.HabitLogs.Add(new HabitLog
                {
                    HabitId = habitId,
                    Date = targetDate,
                    Completed = true
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<HabitLogResponse>> GetHabitLogsAsync(int habitId, int userId)
        {
            var habit = await _context.Habits
                .FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);

            if (habit == null) return new List<HabitLogResponse>();

            return await _context.HabitLogs
                .Where(l => l.HabitId == habitId)
                .OrderByDescending(l => l.Date)
                .Select(l => new HabitLogResponse
                {
                    Id = l.Id,
                    Date = l.Date,
                    Completed = l.Completed
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<WeeklyProgressResponse>> GetWeeklyProgressAsync(int userId)
        {
            var startOfWeek = DateTime.UtcNow.Date.AddDays(-6);
            var habits = await _context.Habits
                .Where(h => h.UserId == userId)
                .Include(h => h.HabitLogs.Where(l => l.Date >= startOfWeek))
                .ToListAsync();

            var result = new List<WeeklyProgressResponse>();

            for (var i = 0; i < 7; i++)
            {
                var day = startOfWeek.AddDays(i);
                var dayName = day.ToString("ddd");

                var completed = habits.Count(h =>
                    h.HabitLogs.Any(l => l.Date.Date == day.Date && l.Completed));

                result.Add(new WeeklyProgressResponse
                {
                    Day = dayName,
                    Completed = completed,
                    Total = habits.Count
                });
            }

            return result;
        }

        public async Task<ImpactSummaryResponse> GetImpactSummaryAsync(int userId)
        {
            var habits = await _context.Habits
                .Where(h => h.UserId == userId &&
                    (h.MoneySavedPerCompletion > 0 ||
                     h.MinutesSavedPerCompletion > 0 ||
                     h.MinutesInvestedPerCompletion > 0))
                .Include(h => h.HabitLogs.Where(l => l.Completed))
                .ToListAsync();

            var thirtyDaysAgo = DateTime.UtcNow.Date.AddDays(-29);
            var response = new ImpactSummaryResponse
            {
                ImpactHabitCount = habits.Count
            };

            foreach (var habit in habits)
            {
                var completedLogs = habit.HabitLogs.Where(l => l.Completed).ToList();
                var completedLast30 = completedLogs.Count(l => l.Date.Date >= thirtyDaysAgo);
                var totalCompletions = completedLogs.Count;

                response.TotalSuccessfulCompletions += totalCompletions;
                response.TotalMoneySaved += totalCompletions * habit.MoneySavedPerCompletion;
                response.TotalMinutesSaved += totalCompletions * habit.MinutesSavedPerCompletion;
                response.TotalMinutesInvested += totalCompletions * habit.MinutesInvestedPerCompletion;

                response.MoneySavedLast30Days += completedLast30 * habit.MoneySavedPerCompletion;
                response.MinutesSavedLast30Days += completedLast30 * habit.MinutesSavedPerCompletion;
                response.MinutesInvestedLast30Days += completedLast30 * habit.MinutesInvestedPerCompletion;
            }

            response.TotalMoneySaved = decimal.Round(response.TotalMoneySaved, 2);
            response.MoneySavedLast30Days = decimal.Round(response.MoneySavedLast30Days, 2);
            return response;
        }

        private static string? NormalizeColor(string? color)
        {
            if (string.IsNullOrWhiteSpace(color)) return null;

            var normalized = color.Trim().ToLowerInvariant();
            var allowed = new HashSet<string>
            {
                "indigo", "purple", "blue", "teal", "green",
                "yellow", "orange", "red", "pink", "cyan"
            };

            return allowed.Contains(normalized) ? normalized : null;
        }

        private static (string icon, string color) GetIconAndColor(string title)
        {
            var t = title.ToLowerInvariant();

            if (t.Contains("water") || t.Contains("drink") || t.Contains("hydrat"))
                return ("💧", "blue");
            if (t.Contains("read") || t.Contains("book") || t.Contains("study"))
                return ("📚", "purple");
            if (t.Contains("gym") || t.Contains("workout") || t.Contains("exercise") || t.Contains("fitness"))
                return ("💪", "red");
            if (t.Contains("run") || t.Contains("jog") || t.Contains("walk"))
                return ("🏃", "orange");
            if (t.Contains("meditat") || t.Contains("yoga") || t.Contains("mind"))
                return ("🧘", "teal");
            if (t.Contains("sleep") || t.Contains("rest"))
                return ("😴", "indigo");
            if (t.Contains("eat") || t.Contains("food") || t.Contains("diet") || t.Contains("healthy"))
                return ("🥗", "green");
            if (t.Contains("code") || t.Contains("program") || t.Contains("develop"))
                return ("💻", "cyan");
            if (t.Contains("write") || t.Contains("journal"))
                return ("✍️", "pink");
            if (t.Contains("music") || t.Contains("guitar") || t.Contains("piano"))
                return ("🎵", "purple");
            if (t.Contains("draw") || t.Contains("paint") || t.Contains("art"))
                return ("🎨", "pink");
            if (t.Contains("clean") || t.Contains("organize"))
                return ("🧹", "green");
            if (t.Contains("money") || t.Contains("save") || t.Contains("budget"))
                return ("💰", "yellow");
            if (t.Contains("wake"))
                return ("⏰", "orange");

            return ("🎯", "purple");
        }

        private static HabitResponse MapToResponse(Habit habit)
        {
            var logs = habit.HabitLogs.OrderByDescending(l => l.Date).ToList();
            var today = DateTime.UtcNow.Date;

            var currentStreak = 0;
            var checkDate = today;

            if (!logs.Any(l => l.Date.Date == today && l.Completed))
                checkDate = today.AddDays(-1);

            while (logs.Any(l => l.Date.Date == checkDate && l.Completed))
            {
                currentStreak++;
                checkDate = checkDate.AddDays(-1);
            }

            var bestStreak = 0;
            var tempStreak = 0;
            var allDates = logs
                .Where(l => l.Completed)
                .Select(l => l.Date.Date)
                .Distinct()
                .OrderBy(d => d)
                .ToList();

            for (var i = 0; i < allDates.Count; i++)
            {
                if (i == 0 || (allDates[i] - allDates[i - 1]).Days == 1)
                    tempStreak++;
                else
                    tempStreak = 1;

                if (tempStreak > bestStreak) bestStreak = tempStreak;
            }

            var thirtyDaysAgo = today.AddDays(-29);
            const int totalDays = 30;
            var completedDays = logs.Count(l => l.Date >= thirtyDaysAgo && l.Completed);
            var completionPercentage = (double)completedDays / totalDays * 100;

            var calendarDays = new List<CalendarDay>();
            for (var i = 29; i >= 0; i--)
            {
                var d = today.AddDays(-i);
                calendarDays.Add(new CalendarDay
                {
                    Date = d.ToString("yyyy-MM-dd"),
                    Completed = logs.Any(l => l.Date.Date == d && l.Completed)
                });
            }

            var totalCompletions = logs.Count(l => l.Completed);

            return new HabitResponse
            {
                Id = habit.Id,
                Title = habit.Title,
                Description = habit.Description,
                CreatedAt = habit.CreatedAt,
                TargetType = habit.TargetType,
                Icon = habit.Icon,
                Color = habit.Color,
                CurrentStreak = currentStreak,
                BestStreak = bestStreak,
                CompletionPercentage = Math.Round(completionPercentage, 1),
                IsCompletedToday = logs.Any(l => l.Date.Date == today && l.Completed),
                CalendarDays = calendarDays,
                MoneySavedPerCompletion = habit.MoneySavedPerCompletion,
                MinutesSavedPerCompletion = habit.MinutesSavedPerCompletion,
                MinutesInvestedPerCompletion = habit.MinutesInvestedPerCompletion,
                TotalCompletions = totalCompletions,
                TotalMoneySaved = decimal.Round(totalCompletions * habit.MoneySavedPerCompletion, 2),
                TotalMinutesSaved = totalCompletions * habit.MinutesSavedPerCompletion,
                TotalMinutesInvested = totalCompletions * habit.MinutesInvestedPerCompletion
            };
        }
    }
}
