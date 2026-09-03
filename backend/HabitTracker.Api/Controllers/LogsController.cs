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
    public class LogsController : ControllerBase
    {
        private readonly IHabitService _habitService;

        public LogsController(IHabitService habitService)
        {
            _habitService = habitService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        [HttpPost]
        public async Task<IActionResult> ToggleLog([FromBody] LogRequest request)
        {
            var result = await _habitService.ToggleHabitLogAsync(
                request.HabitId, GetUserId(), request.Date);
            
            if (!result) return NotFound(new { message = "Habit not found" });
            return Ok(new { message = "Log updated successfully" });
        }

        [HttpGet("{habitId}")]
        public async Task<IActionResult> GetLogs(int habitId)
        {
            var logs = await _habitService.GetHabitLogsAsync(habitId, GetUserId());
            return Ok(logs);
        }
    }
}
