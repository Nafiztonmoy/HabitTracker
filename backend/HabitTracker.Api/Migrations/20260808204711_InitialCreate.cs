using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HabitTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Habits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    TargetType = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    Icon = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Color = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Habits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Habits_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HabitLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    HabitId = table.Column<int>(type: "INTEGER", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    Completed = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HabitLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HabitLogs_Habits_HabitId",
                        column: x => x.HabitId,
                        principalTable: "Habits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "Name", "PasswordHash" },
                values: new object[] { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "demo@habittracker.com", "Demo User", "$2a$11$X3Vf8dGfQZqWvBbNnMmLlOoPpQqRrSsTtUuVvWwXxYyZz1234567" });

            migrationBuilder.InsertData(
                table: "Habits",
                columns: new[] { "Id", "Color", "CreatedAt", "Description", "Icon", "TargetType", "Title", "UserId" },
                values: new object[,]
                {
                    { 1, "purple", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Stay hydrated throughout the day", "🎯", "Daily", "Drink 8 Glasses of Water", 1 },
                    { 2, "purple", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Read a book or article", "🎯", "Daily", "Read for 30 Minutes", 1 },
                    { 3, "purple", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Gym, run, or home workout", "🎯", "Weekly", "Exercise 3x Per Week", 1 }
                });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Completed", "Date", "HabitId" },
                values: new object[] { 1, true, new DateTime(2026, 8, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Date", "HabitId" },
                values: new object[] { 2, new DateTime(2026, 8, 3, 0, 0, 0, 0, DateTimeKind.Utc), 1 });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Completed", "Date", "HabitId" },
                values: new object[,]
                {
                    { 3, true, new DateTime(2026, 8, 4, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { 4, true, new DateTime(2026, 8, 5, 0, 0, 0, 0, DateTimeKind.Utc), 1 }
                });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Date", "HabitId" },
                values: new object[] { 5, new DateTime(2026, 8, 6, 0, 0, 0, 0, DateTimeKind.Utc), 1 });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Completed", "Date", "HabitId" },
                values: new object[,]
                {
                    { 6, true, new DateTime(2026, 8, 7, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { 7, true, new DateTime(2026, 8, 8, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { 8, true, new DateTime(2026, 8, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 9, true, new DateTime(2026, 8, 3, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 10, true, new DateTime(2026, 8, 4, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 11, true, new DateTime(2026, 8, 5, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 12, true, new DateTime(2026, 8, 6, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 13, true, new DateTime(2026, 8, 7, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 14, true, new DateTime(2026, 8, 8, 0, 0, 0, 0, DateTimeKind.Utc), 2 }
                });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Date", "HabitId" },
                values: new object[,]
                {
                    { 15, new DateTime(2026, 8, 2, 0, 0, 0, 0, DateTimeKind.Utc), 3 },
                    { 16, new DateTime(2026, 8, 3, 0, 0, 0, 0, DateTimeKind.Utc), 3 }
                });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Completed", "Date", "HabitId" },
                values: new object[] { 17, true, new DateTime(2026, 8, 4, 0, 0, 0, 0, DateTimeKind.Utc), 3 });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Date", "HabitId" },
                values: new object[,]
                {
                    { 18, new DateTime(2026, 8, 5, 0, 0, 0, 0, DateTimeKind.Utc), 3 },
                    { 19, new DateTime(2026, 8, 6, 0, 0, 0, 0, DateTimeKind.Utc), 3 }
                });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Completed", "Date", "HabitId" },
                values: new object[] { 20, true, new DateTime(2026, 8, 7, 0, 0, 0, 0, DateTimeKind.Utc), 3 });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Date", "HabitId" },
                values: new object[] { 21, new DateTime(2026, 8, 8, 0, 0, 0, 0, DateTimeKind.Utc), 3 });

            migrationBuilder.CreateIndex(
                name: "IX_HabitLogs_Date",
                table: "HabitLogs",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_HabitLogs_HabitId_Date",
                table: "HabitLogs",
                columns: new[] { "HabitId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Habits_UserId",
                table: "Habits",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HabitLogs");

            migrationBuilder.DropTable(
                name: "Habits");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
