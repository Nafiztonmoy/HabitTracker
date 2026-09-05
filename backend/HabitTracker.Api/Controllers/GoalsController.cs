using System.Security.Claims;
using HabitTracker.DTOs;
using HabitTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HabitTracker.Controllers
{
    [ApiController]
    [Route("api/goals")]
    [Authorize]
    public class GoalsController : ControllerBase
    {
        private readonly IGoalService _goalService;

        public GoalsController(IGoalService goalService)
        {
            _goalService = goalService;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetGoals()
        {
            return Ok(await _goalService.GetGoalsAsync(GetUserId()));
        }

        [HttpPost]
        public async Task<IActionResult> CreateGoal(CreateSavingsGoalRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var goal = await _goalService.CreateGoalAsync(request, GetUserId());
            return CreatedAtAction(nameof(GetGoals), new { id = goal.Id }, goal);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGoal(int id, UpdateSavingsGoalRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var goal = await _goalService.UpdateGoalAsync(id, request, GetUserId());
            return goal == null ? NotFound() : Ok(goal);
        }

        [HttpPost("{id}/activate")]
        public async Task<IActionResult> ActivateGoal(int id)
        {
            var goal = await _goalService.ActivateGoalAsync(id, GetUserId());
            return goal == null ? NotFound() : Ok(goal);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            return await _goalService.DeleteGoalAsync(id, GetUserId()) ? NoContent() : NotFound();
        }
    }
}
