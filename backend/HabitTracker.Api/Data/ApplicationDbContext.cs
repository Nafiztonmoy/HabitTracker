using HabitTracker.Models;
using Microsoft.EntityFrameworkCore;

namespace HabitTracker.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Habit> Habits => Set<Habit>();
        public DbSet<HabitLog> HabitLogs => Set<HabitLog>();
        public DbSet<ExternalLogin> ExternalLogins => Set<ExternalLogin>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ============================================
            // USER CONFIGURATION
            // ============================================
            
            modelBuilder.Entity<User>(entity =>
            {
                // Primary Key
                entity.HasKey(u => u.Id);
                
                // Auto-increment ID
                entity.Property(u => u.Id)
                    .ValueGeneratedOnAdd();

                // Required fields with constraints
                entity.Property(u => u.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(u => u.PasswordHash)
                    .IsRequired();

                entity.Property(u => u.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP")
                    .IsRequired();

                // Unique index on Email (case-insensitive lookup)
                entity.HasIndex(u => u.Email)
                    .IsUnique()
                    .HasDatabaseName("IX_Users_Email");

                // User -> Habits (1:N) with Cascade Delete
                entity.HasMany(u => u.Habits)
                    .WithOne(h => h.User)
                    .HasForeignKey(h => h.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.ExternalLogins)
                    .WithOne(login => login.User)
                    .HasForeignKey(login => login.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ============================================
            // EXTERNAL LOGIN CONFIGURATION
            // ============================================

            modelBuilder.Entity<ExternalLogin>(entity =>
            {
                entity.HasKey(login => login.Id);

                entity.Property(login => login.Provider)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(login => login.ProviderUserId)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(login => login.CreatedAt)
                    .IsRequired();

                entity.HasIndex(login => new { login.Provider, login.ProviderUserId })
                    .IsUnique()
                    .HasDatabaseName("IX_ExternalLogins_Provider_ProviderUserId");

                entity.HasIndex(login => login.UserId)
                    .HasDatabaseName("IX_ExternalLogins_UserId");
            });

            // ============================================
            // HABIT CONFIGURATION
            // ============================================
            
            modelBuilder.Entity<Habit>(entity =>
            {
                entity.HasKey(h => h.Id);
                
                entity.Property(h => h.Id)
                    .ValueGeneratedOnAdd();

                entity.Property(h => h.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(h => h.Description)
                    .HasMaxLength(500);

                entity.Property(h => h.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP")
                    .IsRequired();

                entity.Property(h => h.TargetType)
                    .HasConversion<string>()  // Store enum as string in DB
                    .HasMaxLength(10);

                // Index for faster user-specific queries
                entity.HasIndex(h => h.UserId)
                    .HasDatabaseName("IX_Habits_UserId");

                // Habit -> HabitLogs (1:N) with Cascade Delete
                entity.HasMany(h => h.HabitLogs)
                    .WithOne(l => l.Habit)
                    .HasForeignKey(l => l.HabitId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ============================================
            // HABIT LOG CONFIGURATION
            // ============================================
            
            modelBuilder.Entity<HabitLog>(entity =>
            {
                entity.HasKey(l => l.Id);
                
                entity.Property(l => l.Id)
                    .ValueGeneratedOnAdd();

                entity.Property(l => l.Date)
                    .HasColumnType("date")  // Store as date only (no time)
                    .IsRequired();

                entity.Property(l => l.Completed)
                    .HasDefaultValue(false)
                    .IsRequired();

                // Composite index for fast lookup by habit + date
                entity.HasIndex(l => new { l.HabitId, l.Date })
                    .IsUnique()
                    .HasDatabaseName("IX_HabitLogs_HabitId_Date");

                // Index for date range queries (weekly progress)
                entity.HasIndex(l => l.Date)
                    .HasDatabaseName("IX_HabitLogs_Date");
            });

            // ============================================
            // SEED DATA (Demo User + Habits + Logs)
            // ============================================
            
            // Password = "password123" hashed with BCrypt
            var demoPasswordHash = "$2a$11$X3Vf8dGfQZqWvBbNnMmLlOoPpQqRrSsTtUuVvWwXxYyZz1234567";

            modelBuilder.Entity<User>().HasData(
                new User 
                { 
                    Id = 1, 
                    Name = "Demo User", 
                    Email = "demo@habittracker.com",
                    PasswordHash = demoPasswordHash,
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            // Demo Habits
            modelBuilder.Entity<Habit>().HasData(
                new Habit 
                { 
                    Id = 1, 
                    UserId = 1,
                    Title = "Drink 8 Glasses of Water",
                    Description = "Stay hydrated throughout the day",
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    TargetType = TargetType.Daily
                },
                new Habit 
                { 
                    Id = 2, 
                    UserId = 1,
                    Title = "Read for 30 Minutes",
                    Description = "Read a book or article",
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    TargetType = TargetType.Daily
                },
                new Habit 
                { 
                    Id = 3, 
                    UserId = 1,
                    Title = "Exercise 3x Per Week",
                    Description = "Gym, run, or home workout",
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    TargetType = TargetType.Weekly
                }
            );

            // Demo Logs (last 7 days, mixed completion)
            var today = DateTime.UtcNow.Date;
            var logs = new List<HabitLog>();
            int logId = 1;

            // Habit 1: Water - completed 5 of last 7 days
            for (int i = 6; i >= 0; i--)
            {
                logs.Add(new HabitLog
                {
                    Id = logId++,
                    HabitId = 1,
                    Date = today.AddDays(-i),
                    Completed = i != 2 && i != 5  // Missed 2 days ago and 5 days ago
                });
            }

            // Habit 2: Reading - completed every day (perfect streak)
            for (int i = 6; i >= 0; i--)
            {
                logs.Add(new HabitLog
                {
                    Id = logId++,
                    HabitId = 2,
                    Date = today.AddDays(-i),
                    Completed = true
                });
            }

            // Habit 3: Exercise - completed 2 days this week
            var exerciseDays = new[] { 1, 4 }; // 1 day ago and 4 days ago
            for (int i = 6; i >= 0; i--)
            {
                logs.Add(new HabitLog
                {
                    Id = logId++,
                    HabitId = 3,
                    Date = today.AddDays(-i),
                    Completed = exerciseDays.Contains(i)
                });
            }

            modelBuilder.Entity<HabitLog>().HasData(logs);
        }
    }
}
