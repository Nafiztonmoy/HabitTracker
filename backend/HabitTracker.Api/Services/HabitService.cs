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

            return habits.Select(h => MapToResponse(h));
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
                Title = request.Title,
                Description = request.Description,
                TargetType = request.TargetType,
                Icon = icon,
                Color = color
            };

            _context.Habits.Add(habit);
            await _context.SaveChangesAsync();

            return MapToResponse(habit);
        }

        public async Task<HabitResponse?> UpdateHabitAsync(int id, UpdateHabitRequest request, int userId)
        {
            var habit = await _context.Habits
                .FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

            if (habit == null) return null;

            var (icon, generatedColor) = GetIconAndColor(request.Title);
            var color = NormalizeColor(request.Color) ?? generatedColor;

            habit.Title = request.Title;
            habit.Description = request.Description;
            habit.TargetType = request.TargetType;
            habit.Icon = icon;
            habit.Color = color;

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

            for (int i = 0; i < 7; i++)
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
            var t = title.ToLower();

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
                return ("🎵", "violet");
            if (t.Contains("draw") || t.Contains("paint") || t.Contains("art"))
                return ("🎨", "rose");
            if (t.Contains("clean") || t.Contains("organize"))
                return ("🧹", "emerald");
            if (t.Contains("money") || t.Contains("save") || t.Contains("budget"))
                return ("💰", "yellow");
            if (t.Contains("sleep") || t.Contains("wake"))
                return ("⏰", "amber");

            return ("🎯", "purple");
        }

        private HabitResponse MapToResponse(Habit habit)
        {
            var logs = habit.HabitLogs.OrderByDescending(l => l.Date).ToList();
            var today = DateTime.UtcNow.Date;

            int currentStreak = 0;
            var checkDate = today;

            if (!logs.Any(l => l.Date.Date == today && l.Completed))
                checkDate = today.AddDays(-1);

            while (true)
            {
                if (logs.Any(l => l.Date.Date == checkDate && l.Completed))
                {
                    currentStreak++;
                    checkDate = checkDate.AddDays(-1);
                }
                else break;
            }

            int bestStreak = 0;
            int tempStreak = 0;
            var allDates = logs.Where(l => l.Completed).Select(l => l.Date.Date).Distinct().OrderBy(d => d).ToList();

            for (int i = 0; i < allDates.Count; i++)
            {
                if (i == 0 || (allDates[i] - allDates[i - 1]).Days == 1)
                    tempStreak++;
                else
                    tempStreak = 1;

                if (tempStreak > bestStreak) bestStreak = tempStreak;
            }

            var thirtyDaysAgo = today.AddDays(-29);
            var totalDays = 30;
            var completedDays = logs.Count(l => l.Date >= thirtyDaysAgo && l.Completed);
            var completionPercentage = totalDays > 0 ? (double)completedDays / totalDays * 100 : 0;

            // Build calendar for last 30 days
            var calendarDays = new List<CalendarDay>();
            for (int i = 29; i >= 0; i--)
            {
                var d = today.AddDays(-i);
                calendarDays.Add(new CalendarDay
                {
                    Date = d.ToString("yyyy-MM-dd"),
                    Completed = logs.Any(l => l.Date.Date == d && l.Completed)
                });
            }

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
                CalendarDays = calendarDays
            };
        }
    }
}
