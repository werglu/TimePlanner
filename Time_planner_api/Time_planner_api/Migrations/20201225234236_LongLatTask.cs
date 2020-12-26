using Microsoft.EntityFrameworkCore.Migrations;

namespace Time_planner_api.Migrations
{
    public partial class LongLatTask : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Tasks",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Tasks",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Tasks");
        }
    }
}
