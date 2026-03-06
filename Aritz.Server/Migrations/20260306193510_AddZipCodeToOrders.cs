using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aritz.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddZipCodeToOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ORD_ZIP_CODE",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ORD_ZIP_CODE",
                table: "Orders");
        }
    }
}
