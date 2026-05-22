using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CardioSense.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientNotesToHealthSubmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PatientNotes",
                table: "HealthSubmissions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PatientNotes",
                table: "HealthSubmissions");
        }
    }
}
