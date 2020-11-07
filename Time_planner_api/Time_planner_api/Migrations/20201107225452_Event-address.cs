using Microsoft.EntityFrameworkCore.Migrations;

namespace Time_planner_api.Migrations
{
    public partial class Eventaddress : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Events",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StreetAddress",
                table: "Events",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "StreetAddress",
                table: "Events");
        }
    }
}
