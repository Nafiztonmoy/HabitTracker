using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using HabitTracker.DTOs;

namespace HabitTracker.Services
{
    public class GrokAIService : IAIService
    {
        private const string Endpoint =
            "https://api.groq.com/openai/v1/chat/completions";

        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public GrokAIService(
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        private string ApiKey =>
            _configuration["Groq:ApiKey"]?.Trim() ?? string.Empty;

        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(ApiKey);

        public string Provider => "Groq";

        public string Model =>
            _configuration["Groq:Model"]?.Trim() is { Length: > 0 } model
                ? model
                : "openai/gpt-oss-20b";

        public async Task<SmartHabitSuggestionResponse> SuggestHabitAsync(
            SmartHabitSuggestionRequest request,
            IReadOnlyCollection<HabitResponse> existingHabits,
            CancellationToken cancellationToken = default)
        {
            EnsureConfigured();

            var existingHabitsJson =
                JsonSerializer.Serialize(existingHabits, JsonOptions);

            var systemPrompt = """
                You are an assistant inside a habit tracking application.

                Turn the user's goal into one realistic, specific habit.

                Requirements:
                - Keep the title short.
                - Make the description practical.
                - targetType must be exactly "Daily" or "Weekly".
                - Choose one color from:
                  indigo, violet, blue, cyan, emerald, amber, orange, rose.
                - Do not duplicate an existing habit.
                - The reason should briefly explain why the suggested habit is achievable.
                """;

            var userPrompt = $"""
                User goal:
                {request.Goal}

                Existing habits:
                {existingHabitsJson}
                """;

            var schema = new
            {
                type = "object",
                properties = new
                {
                    title = new
                    {
                        type = "string"
                    },
                    description = new
                    {
                        type = "string"
                    },
                    targetType = new
                    {
                        type = "string",
                        @enum = new[] { "Daily", "Weekly" }
                    },
                    color = new
                    {
                        type = "string",
                        @enum = new[]
                        {
                            "indigo",
                            "violet",
                            "blue",
                            "cyan",
                            "emerald",
                            "amber",
                            "orange",
                            "rose"
                        }
                    },
                    reason = new
                    {
                        type = "string"
                    }
                },
                required = new[]
                {
                    "title",
                    "description",
                    "targetType",
                    "color",
                    "reason"
                },
                additionalProperties = false
            };

            var result = await SendStructuredRequestAsync(
                systemPrompt,
                userPrompt,
                "habit_suggestion",
                schema,
                cancellationToken);

            var suggestion =
                JsonSerializer.Deserialize<SmartHabitSuggestionResponse>(
                    result,
                    JsonOptions);

            if (suggestion == null)
            {
                throw new InvalidOperationException(
                    "Groq returned an empty habit suggestion.");
            }

            return suggestion;
        }

        public async Task<WeeklyAIReviewResponse> GenerateWeeklyReviewAsync(
            IReadOnlyCollection<HabitResponse> habits,
            IReadOnlyCollection<WeeklyProgressResponse> weeklyProgress,
            CancellationToken cancellationToken = default)
        {
            EnsureConfigured();

            var habitsJson =
                JsonSerializer.Serialize(habits, JsonOptions);

            var progressJson =
                JsonSerializer.Serialize(weeklyProgress, JsonOptions);

            var systemPrompt = """
                You are an assistant inside a habit tracking application.

                Review only the habit statistics provided by the application.
                Do not invent completion counts, streaks, percentages, or dates.

                Give a concise weekly review.

                Requirements:
                - headline: short and useful.
                - summary: 1 or 2 sentences.
                - win: the clearest positive pattern.
                - watch: the most important area needing attention.
                - nextAction: one realistic action for the coming week.
                """;

            var userPrompt = $"""
                Current habits:
                {habitsJson}

                Weekly progress:
                {progressJson}
                """;

            var schema = new
            {
                type = "object",
                properties = new
                {
                    headline = new
                    {
                        type = "string"
                    },
                    summary = new
                    {
                        type = "string"
                    },
                    win = new
                    {
                        type = "string"
                    },
                    watch = new
                    {
                        type = "string"
                    },
                    nextAction = new
                    {
                        type = "string"
                    }
                },
                required = new[]
                {
                    "headline",
                    "summary",
                    "win",
                    "watch",
                    "nextAction"
                },
                additionalProperties = false
            };

            var result = await SendStructuredRequestAsync(
                systemPrompt,
                userPrompt,
                "weekly_habit_review",
                schema,
                cancellationToken);

            var review =
                JsonSerializer.Deserialize<WeeklyAIReviewResponse>(
                    result,
                    JsonOptions);

            if (review == null)
            {
                throw new InvalidOperationException(
                    "Groq returned an empty weekly review.");
            }

            return review;
        }

        private async Task<string> SendStructuredRequestAsync(
            string systemPrompt,
            string userPrompt,
            string schemaName,
            object schema,
            CancellationToken cancellationToken)
        {
            var requestBody = new
            {
                model = Model,

                messages = new object[]
                {
                    new
                    {
                        role = "system",
                        content = systemPrompt
                    },
                    new
                    {
                        role = "user",
                        content = userPrompt
                    }
                },

                reasoning_effort = "low",

                response_format = new
                {
                    type = "json_schema",

                    json_schema = new
                    {
                        name = schemaName,
                        strict = true,
                        schema
                    }
                }
            };

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                Endpoint);

            request.Headers.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    ApiKey);

            request.Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            using var response =
                await _httpClient.SendAsync(
                    request,
                    cancellationToken);

            var responseText =
                await response.Content.ReadAsStringAsync(
                    cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(
                    $"Groq request failed with status {(int)response.StatusCode}: {responseText}");
            }

            using var document =
                JsonDocument.Parse(responseText);

            if (!document.RootElement.TryGetProperty(
                    "choices",
                    out var choices) ||
                choices.GetArrayLength() == 0)
            {
                throw new InvalidOperationException(
                    "Groq returned no choices.");
            }

            var message = choices[0].GetProperty("message");

            if (!message.TryGetProperty(
                    "content",
                    out var contentElement))
            {
                throw new InvalidOperationException(
                    "Groq returned no message content.");
            }

            var content = contentElement.GetString();

            if (string.IsNullOrWhiteSpace(content))
            {
                throw new InvalidOperationException(
                    "Groq returned empty message content.");
            }

            return content;
        }

        private void EnsureConfigured()
        {
            if (!IsConfigured)
            {
                throw new InvalidOperationException(
                    "Groq AI is not configured. Add Groq:ApiKey to .NET user secrets.");
            }
        }
    }
}