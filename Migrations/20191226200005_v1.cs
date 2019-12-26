using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace BreathRateRecognition.Migrations
{
    public partial class v1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Recordings",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recordings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RecordingMetrics",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(nullable: false),
                    Port = table.Column<string>(nullable: false),
                    Value = table.Column<int>(nullable: false),
                    Timestamp = table.Column<DateTime>(nullable: false),
                    RecordingId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecordingMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecordingMetrics_Recordings_RecordingId",
                        column: x => x.RecordingId,
                        principalTable: "Recordings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RecordingMetrics_RecordingId",
                table: "RecordingMetrics",
                column: "RecordingId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RecordingMetrics");

            migrationBuilder.DropTable(
                name: "Recordings");
        }
    }
}
