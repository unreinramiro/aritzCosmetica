using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aritz.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderDetailUnitPrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ODD_UNIT_PRICE",
                table: "OrderDetails",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ODD_UNIT_PRICE",
                table: "OrderDetails");
        }
    }
}
