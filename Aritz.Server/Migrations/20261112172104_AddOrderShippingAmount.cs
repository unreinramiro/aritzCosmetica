using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aritz.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderShippingAmount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ORD_SHIPPING_AMOUNT",
                table: "Orders",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ORD_SHIPPING_AMOUNT",
                table: "Orders");
        }
    }
}
