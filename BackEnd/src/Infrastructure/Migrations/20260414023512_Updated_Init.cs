using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EFPractice.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Updated_Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            for (int i = 1; i <= 9; i++)
            {
                migrationBuilder.UpdateData(
                    table: "UserTasks",
                    keyColumn: "Id",
                    keyValue: i,
                    column: "Recurrence",
                    value: 1);
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            for (int i = 1; i <= 9; i++)
            {
                migrationBuilder.UpdateData(
                    table: "UserTasks",
                    keyColumn: "Id",
                    keyValue: i,
                    column: "Recurrence",
                    value: 0);
            }
        }
    }
}
