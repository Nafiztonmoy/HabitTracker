using System.Security.Claims;
using HabitTracker.DTOs;
using HabitTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HabitTracker.Controllers
{
    [ApiController]
    [Route("api/ai")]
    [Authorize]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;
        private readonly IHabitService _habitService;

        public AIController(IAIService aiService, IHabitService habitService)
        {
            _aiService = aiService;
            _habitService = habitService;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            return Ok(new AIStatusResponse
            {
                Configured = _aiService.IsConfigured,
                Provider = _aiService.Provider,
                Model = _aiService.Model
            });
        }

        [HttpPost("smart-habit")]
        public async Task<IActionResult> SuggestHabit(
            SmartHabitSuggestionRequest request,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            if (!_aiService.IsConfigured)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    message = "Grok AI is not configured. Add XAI:ApiKey to .NET user secrets."
                });
            }

            try
            {
                var habits = await _habitService.GetUserHabitsAsync(GetUserId());
                var suggestion = await _aiService.SuggestHabitAsync(request, habits.ToList(), cancellationToken);
                return Ok(suggestion);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                return StatusCode(499);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Grok smart-habit error: {ex}");
                return StatusCode(StatusCodes.Status502BadGateway, new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("weekly-review")]
        public async Task<IActionResult> WeeklyReview(CancellationToken cancellationToken)
        {
            if (!_aiService.IsConfigured)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    message = "Grok AI is not configured. Add XAI:ApiKey to .NET user secrets."
                });
            }

            try
            {
                var userId = GetUserId();
                var habits = (await _habitService.GetUserHabitsAsync(userId)).ToList();

                if (habits.Count == 0)
                    return BadRequest(new { message = "Create at least one habit before generating a weekly review." });

                var weeklyProgress = (await _habitService.GetWeeklyProgressAsync(userId)).ToList();
                var review = await _aiService.GenerateWeeklyReviewAsync(habits, weeklyProgress, cancellationToken);
                return Ok(review);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                return StatusCode(499);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Grok weekly-review error: {ex}");
                return StatusCode(StatusCodes.Status502BadGateway, new
                {
                    message = ex.Message
                });
            }
        }
    }
}
