using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EFPractice.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Setup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        -- Create TaskLists if it does not exist
        IF NOT EXISTS (
            SELECT 1 
            FROM sys.tables 
            WHERE name = 'TaskLists'
        )
        BEGIN
            CREATE TABLE [dbo].[TaskLists] (
                [Id] INT IDENTITY(1,1) NOT NULL,
                [Title] NVARCHAR(200) NOT NULL,
                CONSTRAINT [PK_TaskLists] PRIMARY KEY ([Id])
            );
        END
    ");

            migrationBuilder.Sql(@"
        -- Create UserTasks if it does not exist
        IF NOT EXISTS (
            SELECT 1 
            FROM sys.tables 
            WHERE name = 'UserTasks'
        )
        BEGIN
            CREATE TABLE [dbo].[UserTasks] (
                [Id] INT NOT NULL,
                [Title] NVARCHAR(200) NOT NULL,
                [Description] NVARCHAR(1000) NULL,
                [Priority] NVARCHAR(MAX) NOT NULL,
                [Done] BIT NOT NULL,
                [ListID] INT NOT NULL,
                [Deadline] DATETIME2 NULL,
                CONSTRAINT [PK_UserTasks] PRIMARY KEY ([Id]),
                CONSTRAINT [FK_UserTasks_TaskLists_ListID]
                    FOREIGN KEY ([ListID])
                    REFERENCES [dbo].[TaskLists] ([Id])
            );

            CREATE INDEX [IX_UserTasks_ListID]
                ON [dbo].[UserTasks] ([ListID]);
        END
    ");
        }
        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        IF EXISTS (
            SELECT 1 
            FROM sys.tables 
            WHERE name = 'UserTasks'
        )
        BEGIN
            DROP TABLE [dbo].[UserTasks];
        END
    ");

            migrationBuilder.Sql(@"
        IF EXISTS (
            SELECT 1 
            FROM sys.tables 
            WHERE name = 'TaskLists'
        )
        BEGIN
            DROP TABLE [dbo].[TaskLists];
        END
    ");
        }
    }
}