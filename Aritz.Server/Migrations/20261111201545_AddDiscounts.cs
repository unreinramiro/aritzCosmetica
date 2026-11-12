using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aritz.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ORD_DISCOUNT_AMOUNT",
                table: "Orders",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "ORD_DIS_ID",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Discounts",
                columns: table => new
                {
                    DIS_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DIS_CODE = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DIS_NAME = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DIS_TYPE = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DIS_DISCOUNT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DIS_MIN_AMOUNT = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DIS_START_DATE = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DIS_END_DATE = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DIS_MAX_USES = table.Column<int>(type: "int", nullable: true),
                    DIS_USED_COUNT = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    DIS_IS_ACTIVE = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Discounts", x => x.DIS_ID);
                    table.CheckConstraint("CK_Discounts_TYPE", "[DIS_TYPE] IN ('PERCENTAGE','FIXED')");
                    table.CheckConstraint("CK_Discounts_VALUE", "[DIS_DISCOUNT] > 0 AND ([DIS_TYPE] <> 'PERCENTAGE' OR [DIS_DISCOUNT] <= 100)");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ORD_DIS_ID",
                table: "Orders",
                column: "ORD_DIS_ID");

            migrationBuilder.CreateIndex(
                name: "UQ_Discounts_CODE",
                table: "Discounts",
                column: "DIS_CODE",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Discounts_ORD_DIS_ID",
                table: "Orders",
                column: "ORD_DIS_ID",
                principalTable: "Discounts",
                principalColumn: "DIS_ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Discounts_ORD_DIS_ID",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "Discounts");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ORD_DIS_ID",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ORD_DISCOUNT_AMOUNT",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ORD_DIS_ID",
                table: "Orders");
        }
    }
}
