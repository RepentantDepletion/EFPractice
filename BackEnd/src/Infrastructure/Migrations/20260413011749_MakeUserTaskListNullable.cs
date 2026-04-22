using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EFPractice.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeUserTaskListNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserTasks_TaskLists_ListID",
                table: "UserTasks");

            migrationBuilder.AlterColumn<int>(
                name: "ListID",
                table: "UserTasks",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_UserTasks_TaskLists_ListID",
                table: "UserTasks",
                column: "ListID",
                principalTable: "TaskLists",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserTasks_TaskLists_ListID",
                table: "UserTasks");

            migrationBuilder.AlterColumn<int>(
                name: "ListID",
                table: "UserTasks",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_UserTasks_TaskLists_ListID",
                table: "UserTasks",
                column: "ListID",
                principalTable: "TaskLists",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
