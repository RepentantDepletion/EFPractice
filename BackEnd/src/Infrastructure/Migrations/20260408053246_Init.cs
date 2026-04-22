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
            // Seed TaskLists
            migrationBuilder.InsertData(
                table: "TaskLists",
                columns: new[] { "Id", "Title" },
                values: new object[,]
                {
                { 1, "Tasks" },
                { 2, "Work" },
                { 3, "Personal" },
                { 4, "Shopping" },
                { 5, "Fitness" }
                });

            // Seed UserTasks
            migrationBuilder.InsertData(
                table: "UserTasks",
                columnTypes: new[]
                {
                "int",
                "nvarchar(200)",
                "nvarchar(1000)",
                "datetime2",
                "int",
                "bit",
                "nvarchar(max)",
                "int"
                },
                columns: new[]
                {
                "Id",
                "Title",
                "Description",
                "Deadline",
                "ListID",
                "Done",
                "Priority",
                "Recurrence"
                },
                values: new object[,]
                {
                {
                    1,
                    "Make a todo list 📃",
                    "Create a todo list to keep track of my tasks",
                    new DateTime(2024, 7, 1, 18, 0, 0),
                    1,
                    false,
                    "1",
                    1
                },
                {
                    2,
                    "Buy groceries 🛒",
                    "Milk, Bread, Eggs, Cheese",
                    new DateTime(2024, 7, 1, 18, 0, 0),
                    1,
                    false,
                    "2",
                    1
                },
                {
                    3,
                    "Go for a run 🏃‍♂️",
                    "Run 5 kilometers in the park",
                    new DateTime(2024, 7, 2, 7, 0, 0),
                    1,
                    false,
                    "3",
                    1
                },
                {
                    4,
                    "Read a book 📚",
                    "Read \"The Great Gatsby\" by F. Scott Fitzgerald",
                    new DateTime(2024, 7, 3, 20, 0, 0),
                    1,
                    false,
                    "4",
                    1
                },
                {
                    5,
                    "Call Mom 📞",
                    "Check in with Mom and see how she is doing",
                    new DateTime(2024, 7, 1, 19, 0, 0),
                    1,
                    false,
                    "5",
                    1
                },
                {
                    6,
                    "Clean the house 🧹",
                    "Vacuum, dust, and mop the floors",
                    new DateTime(2024, 7, 4, 10, 0, 0),
                    1,
                    false,
                    "6",
                    1
                },
                {
                    7,
                    "Finish project report 📊",
                    "Complete the final report for the project and submit it to the manager",
                    new DateTime(2024, 7, 5, 17, 0, 0),
                    1,
                    false,
                    "7",
                    1
                },
                {
                    8,
                    "Plan weekend trip 🏖️",
                    "Research and plan a weekend trip to the beach with friends",
                    new DateTime(2024, 7, 6, 12, 0, 0),
                    1,
                    false,
                    "8",
                    1
                },
                {
                    9,
                    "Attend yoga class 🧘‍♀️",
                    "Go to the local gym for a yoga class to relax and unwind",
                    new DateTime(2024, 7, 7, 18, 0, 0),
                    1,
                    false,
                    "9",
                    1
                }
                });
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
