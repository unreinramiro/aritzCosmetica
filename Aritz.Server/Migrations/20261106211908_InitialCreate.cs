using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aritz.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CAT_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CAT_NAME = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CAT_DESCRIPTION = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CAT_CREATED_DATE = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CAT_ID);
                });

            migrationBuilder.CreateTable(
                name: "PaymentMethod",
                columns: table => new
                {
                    PMT_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PMT_NAME = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentMethod", x => x.PMT_ID);
                });

            migrationBuilder.CreateTable(
                name: "ShippingZones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MinZipCode = table.Column<int>(type: "int", nullable: false),
                    MaxZipCode = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShippingZones", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    USR_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    USR_NAME = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    USR_SURNAME = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    USR_EMAIL = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    USR_PASSWORD_HASH = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    USR_NEW_PASSWORD_HASH = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USR_PHONE_NUMBER = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    USR_CREATED_DATE = table.Column<DateTime>(type: "datetime2", nullable: true),
                    USR_IS_ADMIN = table.Column<bool>(type: "bit", nullable: true),
                    USR_IS_VERIFIED = table.Column<bool>(type: "bit", nullable: false),
                    USR_VERIFICATION_CODE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USR_VERIFICATION_EXPIRATION = table.Column<DateTime>(type: "datetime2", nullable: true),
                    USR_DOCUMENT_TYPE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USR_DOCUMENT_NUMBER = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USR_PROVINCE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USR_CITY = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USR_POSTAL_CODE = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USR_STREET = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USR_STREET_NUMBER = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USR_FLOOR = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    USR_APARTMENT = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.USR_ID);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    PRD_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PRD_NAME = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PRD_DESCRIPTION = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PRD_PRICE = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PRD_QUANTITY = table.Column<int>(type: "int", nullable: false),
                    PRD_IMAGE = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PRD_CAT_ID = table.Column<int>(type: "int", nullable: false),
                    PRD_IS_ACTIVE = table.Column<bool>(type: "bit", nullable: true),
                    PRD_CREATED_DATE = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.PRD_ID);
                    table.ForeignKey(
                        name: "FK_Products_Categories_PRD_CAT_ID",
                        column: x => x.PRD_CAT_ID,
                        principalTable: "Categories",
                        principalColumn: "CAT_ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Cart",
                columns: table => new
                {
                    CAR_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CAR_CREATED_DATE = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CAR_USR_ID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cart", x => x.CAR_ID);
                    table.ForeignKey(
                        name: "FK_Cart_Users_CAR_USR_ID",
                        column: x => x.CAR_USR_ID,
                        principalTable: "Users",
                        principalColumn: "USR_ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    ORD_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ORD_USR_ID = table.Column<int>(type: "int", nullable: false),
                    ORD_ORDER_DATE = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ORD_TOTAL_AMOUNT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ORD_STATUS = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ORD_PMT_ID = table.Column<int>(type: "int", nullable: false),
                    ORD_ZIP_CODE = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.ORD_ID);
                    table.ForeignKey(
                        name: "FK_Orders_PaymentMethod_ORD_PMT_ID",
                        column: x => x.ORD_PMT_ID,
                        principalTable: "PaymentMethod",
                        principalColumn: "PMT_ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Orders_Users_ORD_USR_ID",
                        column: x => x.ORD_USR_ID,
                        principalTable: "Users",
                        principalColumn: "USR_ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductImages",
                columns: table => new
                {
                    IMG_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IMG_URL = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IMG_PRD_ID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductImages", x => x.IMG_ID);
                    table.ForeignKey(
                        name: "FK_ProductImages_Products_IMG_PRD_ID",
                        column: x => x.IMG_PRD_ID,
                        principalTable: "Products",
                        principalColumn: "PRD_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CartItems",
                columns: table => new
                {
                    CAI_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CAI_CAR_ID = table.Column<int>(type: "int", nullable: false),
                    CAI_PRD_ID = table.Column<int>(type: "int", nullable: false),
                    CAI_QUANTITY = table.Column<int>(type: "int", nullable: false),
                    CAI_TOTAL_PRICE = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartItems", x => x.CAI_ID);
                    table.ForeignKey(
                        name: "FK_CartItems_Cart_CAI_CAR_ID",
                        column: x => x.CAI_CAR_ID,
                        principalTable: "Cart",
                        principalColumn: "CAR_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CartItems_Products_CAI_PRD_ID",
                        column: x => x.CAI_PRD_ID,
                        principalTable: "Products",
                        principalColumn: "PRD_ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrderDetails",
                columns: table => new
                {
                    ODD_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ODD_ORD_ID = table.Column<int>(type: "int", nullable: false),
                    ODD_PRD_ID = table.Column<int>(type: "int", nullable: false),
                    ODD_QUANTITY = table.Column<int>(type: "int", nullable: false),
                    ODD_TOTAL_PRICE = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderDetails", x => x.ODD_ID);
                    table.ForeignKey(
                        name: "FK_OrderDetails_Orders_ODD_ORD_ID",
                        column: x => x.ODD_ORD_ID,
                        principalTable: "Orders",
                        principalColumn: "ORD_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderDetails_Products_ODD_PRD_ID",
                        column: x => x.ODD_PRD_ID,
                        principalTable: "Products",
                        principalColumn: "PRD_ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    PAY_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PAY_ORD_ID = table.Column<int>(type: "int", nullable: false),
                    PAY_PAYMENT_DATE = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PAY_AMOUNT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PAY_STATUS = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PAY_PAYMENT_REFERENCE = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.PAY_ID);
                    table.ForeignKey(
                        name: "FK_Payments_Orders_PAY_ORD_ID",
                        column: x => x.PAY_ORD_ID,
                        principalTable: "Orders",
                        principalColumn: "ORD_ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Receipts",
                columns: table => new
                {
                    RCP_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RCP_ORD_ID = table.Column<int>(type: "int", nullable: false),
                    RCP_PATH = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RCP_UPLOAD_DATE = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Receipts", x => x.RCP_ID);
                    table.ForeignKey(
                        name: "FK_Receipts_Orders_RCP_ORD_ID",
                        column: x => x.RCP_ORD_ID,
                        principalTable: "Orders",
                        principalColumn: "ORD_ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cart_CAR_USR_ID",
                table: "Cart",
                column: "CAR_USR_ID");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CAI_CAR_ID",
                table: "CartItems",
                column: "CAI_CAR_ID");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CAI_PRD_ID",
                table: "CartItems",
                column: "CAI_PRD_ID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_ODD_ORD_ID",
                table: "OrderDetails",
                column: "ODD_ORD_ID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_ODD_PRD_ID",
                table: "OrderDetails",
                column: "ODD_PRD_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ORD_PMT_ID",
                table: "Orders",
                column: "ORD_PMT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ORD_USR_ID",
                table: "Orders",
                column: "ORD_USR_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PAY_ORD_ID",
                table: "Payments",
                column: "PAY_ORD_ID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_IMG_PRD_ID",
                table: "ProductImages",
                column: "IMG_PRD_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Products_PRD_CAT_ID",
                table: "Products",
                column: "PRD_CAT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Receipts_RCP_ORD_ID",
                table: "Receipts",
                column: "RCP_ORD_ID",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CartItems");

            migrationBuilder.DropTable(
                name: "OrderDetails");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "ProductImages");

            migrationBuilder.DropTable(
                name: "Receipts");

            migrationBuilder.DropTable(
                name: "ShippingZones");

            migrationBuilder.DropTable(
                name: "Cart");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "PaymentMethod");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
