using System.Security.Claims;
using HabitTracker.DTOs;
using HabitTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HabitTracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HabitsController : ControllerBase
    {
        private readonly IHabitService _habitService;

        public HabitsController(IHabitService habitService)
        {
            _habitService = habitService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        [HttpGet]
        public async Task<IActionResult> GetHabits()
        {
            var habits = await _habitService.GetUserHabitsAsync(GetUserId());
            return Ok(habits);
        }

        [HttpPost]
        public async Task<IActionResult> CreateHabit(CreateHabitRequest request)
        {
            var habit = await _habitService.CreateHabitAsync(request, GetUserId());
            return CreatedAtAction(nameof(GetHabits), new { id = habit.Id }, habit);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHabit(int id, UpdateHabitRequest request)
        {
            var habit = await _habitService.UpdateHabitAsync(id, request, GetUserId());
            if (habit == null) return NotFound();
            return Ok(habit);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHabit(int id)
        {
            var result = await _habitService.DeleteHabitAsync(id, GetUserId());
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpGet("weekly-progress")]
        public async Task<IActionResult> GetWeeklyProgress()
        {
            var progress = await _habitService.GetWeeklyProgressAsync(GetUserId());
            return Ok(progress);
        }
    }
}
