using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HabitTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExternalLogins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProviderUserId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalLogins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExternalLogins_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Habits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    TargetType = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Icon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
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
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HabitId = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    Completed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
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
                values: new object[] { 1, true, new DateTime(2026, 8, 29, 0, 0, 0, 0, DateTimeKind.Utc), 1 });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Date", "HabitId" },
                values: new object[] { 2, new DateTime(2026, 8, 30, 0, 0, 0, 0, DateTimeKind.Utc), 1 });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Completed", "Date", "HabitId" },
                values: new object[,]
                {
                    { 3, true, new DateTime(2026, 8, 31, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { 4, true, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 }
                });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Date", "HabitId" },
                values: new object[] { 5, new DateTime(2026, 9, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Completed", "Date", "HabitId" },
                values: new object[,]
                {
                    { 6, true, new DateTime(2026, 9, 3, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { 7, true, new DateTime(2026, 9, 4, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { 8, true, new DateTime(2026, 8, 29, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 9, true, new DateTime(2026, 8, 30, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 10, true, new DateTime(2026, 8, 31, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 11, true, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 12, true, new DateTime(2026, 9, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 13, true, new DateTime(2026, 9, 3, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { 14, true, new DateTime(2026, 9, 4, 0, 0, 0, 0, DateTimeKind.Utc), 2 }
                });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Date", "HabitId" },
                values: new object[,]
                {
                    { 15, new DateTime(2026, 8, 29, 0, 0, 0, 0, DateTimeKind.Utc), 3 },
                    { 16, new DateTime(2026, 8, 30, 0, 0, 0, 0, DateTimeKind.Utc), 3 }
                });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Completed", "Date", "HabitId" },
                values: new object[] { 17, true, new DateTime(2026, 8, 31, 0, 0, 0, 0, DateTimeKind.Utc), 3 });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Date", "HabitId" },
                values: new object[,]
                {
                    { 18, new DateTime(2026, 9, 1, 0, 0, 0, 0, DateTimeKind.Utc), 3 },
                    { 19, new DateTime(2026, 9, 2, 0, 0, 0, 0, DateTimeKind.Utc), 3 }
                });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Completed", "Date", "HabitId" },
                values: new object[] { 20, true, new DateTime(2026, 9, 3, 0, 0, 0, 0, DateTimeKind.Utc), 3 });

            migrationBuilder.InsertData(
                table: "HabitLogs",
                columns: new[] { "Id", "Date", "HabitId" },
                values: new object[] { 21, new DateTime(2026, 9, 4, 0, 0, 0, 0, DateTimeKind.Utc), 3 });

            migrationBuilder.CreateIndex(
                name: "IX_ExternalLogins_Provider_ProviderUserId",
                table: "ExternalLogins",
                columns: new[] { "Provider", "ProviderUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExternalLogins_UserId",
                table: "ExternalLogins",
                column: "UserId");

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
                name: "ExternalLogins");

            migrationBuilder.DropTable(
                name: "HabitLogs");

            migrationBuilder.DropTable(
                name: "Habits");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
