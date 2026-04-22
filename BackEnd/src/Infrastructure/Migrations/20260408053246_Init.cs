using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EFPractice.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [TaskLists] ON;

                INSERT INTO [TaskLists] ([Id], [Title])
                SELECT v.[Id], v.[Title]
                FROM (VALUES
                    (1, N'Tasks'),
                    (2, N'Work'),
                    (3, N'Personal'),
                    (4, N'Shopping'),
                    (5, N'Fitness')
                ) AS v([Id], [Title])
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM [TaskLists] t
                    WHERE t.[Id] = v.[Id]
                );

                SET IDENTITY_INSERT [TaskLists] OFF;
            ");

            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [UserTasks] ON;

                INSERT INTO [UserTasks] ([Id], [Title], [Description], [Deadline], [ListID], [Done], [Priority], [Recurrence])
                SELECT v.[Id], v.[Title], v.[Description], v.[Deadline], v.[ListID], v.[Done], v.[Priority], v.[Recurrence]
                FROM (VALUES
                    (1, N'Make a todo list 📃', N'Create a todo list to keep track of my tasks', CAST('2024-07-01T18:00:00' AS datetime2), 1, CAST(0 AS bit), N'1', 1),
                    (2, N'Buy groceries 🛒', N'Milk, Bread, Eggs, Cheese', CAST('2024-07-01T18:00:00' AS datetime2), 1, CAST(0 AS bit), N'2', 1),
                    (3, N'Go for a run 🏃‍♂️', N'Run 5 kilometers in the park', CAST('2024-07-02T07:00:00' AS datetime2), 1, CAST(0 AS bit), N'3', 1),
                    (4, N'Read a book 📚', N'Read ""The Great Gatsby"" by F. Scott Fitzgerald', CAST('2024-07-03T20:00:00' AS datetime2), 1, CAST(0 AS bit), N'4', 1),
                    (5, N'Call Mom 📞', N'Check in with Mom and see how she is doing', CAST('2024-07-01T19:00:00' AS datetime2), 1, CAST(0 AS bit), N'5', 1),
                    (6, N'Clean the house 🧹', N'Vacuum, dust, and mop the floors', CAST('2024-07-04T10:00:00' AS datetime2), 1, CAST(0 AS bit), N'6', 1),
                    (7, N'Finish project report 📊', N'Complete the final report for the project and submit it to the manager', CAST('2024-07-05T17:00:00' AS datetime2), 1, CAST(0 AS bit), N'7', 1),
                    (8, N'Plan weekend trip 🏖️', N'Research and plan a weekend trip to the beach with friends', CAST('2024-07-06T12:00:00' AS datetime2), 1, CAST(0 AS bit), N'8', 1),
                    (9, N'Attend yoga class 🧘‍♀️', N'Go to the local gym for a yoga class to relax and unwind', CAST('2024-07-07T18:00:00' AS datetime2), 1, CAST(0 AS bit), N'9', 1)
                ) AS v([Id], [Title], [Description], [Deadline], [ListID], [Done], [Priority], [Recurrence])
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM [UserTasks] t
                    WHERE t.[Id] = v.[Id]
                );

                SET IDENTITY_INSERT [UserTasks] OFF;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove UserTasks
            for (int i = 1; i <= 9; i++)
            {
                migrationBuilder.DeleteData(
                    table: "UserTasks",
                    keyColumn: "Id",
                    keyValue: i);
            }

            // Remove TaskLists
            for (int i = 1; i <= 5; i++)
            {
                migrationBuilder.DeleteData(
                    table: "TaskLists",
                    keyColumn: "Id",
                    keyValue: i);
            }
        }
    }
}
