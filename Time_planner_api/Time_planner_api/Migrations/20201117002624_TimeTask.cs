using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Time_planner_api.Migrations
{
    public partial class TimeTask : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Date0",
                table: "Tasks",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Date1",
                table: "Tasks",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Date2",
                table: "Tasks",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Date3",
                table: "Tasks",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Date4",
                table: "Tasks",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Date5",
                table: "Tasks",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Date6",
                table: "Tasks",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Days",
                table: "Tasks",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Split",
                table: "Tasks",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Time",
                table: "Tasks",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Date0",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Date1",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Date2",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Date3",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Date4",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Date5",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Date6",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Days",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Split",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Time",
                table: "Tasks");
        }
    }
}
