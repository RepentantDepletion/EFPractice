using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EFPractice.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserID",
                table: "UserTasks",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "__UNASSIGNED__");

            migrationBuilder.AddColumn<string>(
                name: "UserID",
                table: "TaskLists",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "__UNASSIGNED__");

            migrationBuilder.CreateIndex(
                name: "IX_UserTasks_UserID",
                table: "UserTasks",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_TaskLists_UserID",
                table: "TaskLists",
                column: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserTasks_UserID",
                table: "UserTasks");

            migrationBuilder.DropIndex(
                name: "IX_TaskLists_UserID",
                table: "TaskLists");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "UserTasks");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "TaskLists");
        }
    }
}
