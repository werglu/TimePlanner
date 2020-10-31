using Microsoft.EntityFrameworkCore.Migrations;

namespace Time_planner_api.Migrations
{
    public partial class Not1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Events_EventId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_MessageTemplate_MessageId",
                table: "Notification");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notification",
                table: "Notification");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MessageTemplate",
                table: "MessageTemplate");

            migrationBuilder.RenameTable(
                name: "Notification",
                newName: "Notifications");

            migrationBuilder.RenameTable(
                name: "MessageTemplate",
                newName: "Messages");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_MessageId",
                table: "Notifications",
                newName: "IX_Notifications_MessageId");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_EventId",
                table: "Notifications",
                newName: "IX_Notifications_EventId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Messages",
                table: "Messages",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Events_EventId",
                table: "Notifications",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Messages_MessageId",
                table: "Notifications",
                column: "MessageId",
                principalTable: "Messages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Events_EventId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Messages_MessageId",
                table: "Notifications");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Messages",
                table: "Messages");

            migrationBuilder.RenameTable(
                name: "Notifications",
                newName: "Notification");

            migrationBuilder.RenameTable(
                name: "Messages",
                newName: "MessageTemplate");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_MessageId",
                table: "Notification",
                newName: "IX_Notification_MessageId");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_EventId",
                table: "Notification",
                newName: "IX_Notification_EventId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notification",
                table: "Notification",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MessageTemplate",
                table: "MessageTemplate",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Events_EventId",
                table: "Notification",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_MessageTemplate_MessageId",
                table: "Notification",
                column: "MessageId",
                principalTable: "MessageTemplate",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
