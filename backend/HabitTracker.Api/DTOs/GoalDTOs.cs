using System.ComponentModel.DataAnnotations;

namespace HabitTracker.DTOs
{
    public class CreateSavingsGoalRequest
    {
        [Required, MinLength(2), MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [Range(typeof(decimal), "1", "1000000000")]
        public decimal TargetAmount { get; set; }

        [Range(typeof(decimal), "0", "1000000000")]
        public decimal StartingAmount { get; set; }

        public DateTime? TargetDate { get; set; }
        public bool MakeActive { get; set; } = true;
    }

    public class UpdateSavingsGoalRequest
    {
        [Required, MinLength(2), MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [Range(typeof(decimal), "1", "1000000000")]
        public decimal TargetAmount { get; set; }

        [Range(typeof(decimal), "0", "1000000000")]
        public decimal StartingAmount { get; set; }

        public DateTime? TargetDate { get; set; }
    }

    public class SavingsGoalResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal TargetAmount { get; set; }
        public decimal StartingAmount { get; set; }
        public decimal HabitSavingsApplied { get; set; }
        public decimal CurrentAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public double ProgressPercentage { get; set; }
        public bool IsActive { get; set; }
        public bool IsComplete { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? TargetDate { get; set; }
    }
}
