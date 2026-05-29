using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CardioSense.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FullName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HealthSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Age = table.Column<int>(type: "integer", nullable: false),
                    Gender = table.Column<int>(type: "integer", nullable: false),
                    ApHi = table.Column<int>(type: "integer", nullable: false),
                    ApLo = table.Column<int>(type: "integer", nullable: false),
                    Cholesterol = table.Column<int>(type: "integer", nullable: false),
                    Glucose = table.Column<int>(type: "integer", nullable: false),
                    Smoke = table.Column<int>(type: "integer", nullable: false),
                    Alco = table.Column<int>(type: "integer", nullable: false),
                    Active = table.Column<int>(type: "integer", nullable: false),
                    BMI = table.Column<float>(type: "real", nullable: false),
                    PatientNotes = table.Column<string>(type: "text", nullable: false),
                    RiskScore = table.Column<float>(type: "real", nullable: false),
                    RiskLevel = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    LLMAdvice = table.Column<string>(type: "text", nullable: false),
                    DoctorNotes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthSubmissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HealthSubmissions_UserId",
                table: "HealthSubmissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HealthSubmissions");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
