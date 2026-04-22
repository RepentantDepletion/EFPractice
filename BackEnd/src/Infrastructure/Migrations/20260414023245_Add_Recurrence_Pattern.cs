using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EFPractice.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add_Recurrence_Pattern : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('dbo.UserTasks', 'Recurrence') IS NULL
BEGIN
    ALTER TABLE [dbo].[UserTasks]
    ADD [Recurrence] INT NOT NULL CONSTRAINT [DF_UserTasks_Recurrence] DEFAULT (0);
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('dbo.UserTasks', 'Recurrence') IS NOT NULL
BEGIN
    DECLARE @ConstraintName NVARCHAR(128);

    SELECT @ConstraintName = dc.name
    FROM sys.default_constraints dc
    INNER JOIN sys.columns c
        ON c.default_object_id = dc.object_id
    INNER JOIN sys.tables t
        ON t.object_id = c.object_id
    WHERE t.name = 'UserTasks' AND c.name = 'Recurrence';

    IF @ConstraintName IS NOT NULL
        EXEC('ALTER TABLE [dbo].[UserTasks] DROP CONSTRAINT [' + @ConstraintName + ']');

    ALTER TABLE [dbo].[UserTasks] DROP COLUMN [Recurrence];
END
");
        }
    }
}
