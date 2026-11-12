using Microsoft.EntityFrameworkCore;
using Aritz.Server.Models;

namespace Aritz.Server.Data
{
    public class AritzDbContext : DbContext
    {
        public AritzDbContext(DbContextOptions<AritzDbContext> options) : base(options)
        {
        }

        // Declaración de tablas
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItems> CartItems { get; set; }
        public DbSet<Users> Users { get; set; }
        public DbSet<Orders> Orders { get; set; }
        public DbSet<OrderDetails> OrderDetails { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<Receipts> Receipts { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ShippingZone> ShippingZones { get; set; }

        public DbSet<Discount> Discounts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuración de Users, Products, Categories, Cart, CartItems (mantenidas como en mensajes anteriores)
            modelBuilder.Entity<Users>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(u => u.USR_ID);
                entity.Property(u => u.USR_NAME).HasColumnName("USR_NAME").HasMaxLength(100).IsRequired();
                entity.Property(u => u.USR_SURNAME).HasColumnName("USR_SURNAME").HasMaxLength(100).IsRequired();
                entity.Property(u => u.USR_EMAIL).HasColumnName("USR_EMAIL").HasMaxLength(255).IsRequired();
                entity.Property(u => u.USR_PASSWORD_HASH).HasColumnName("USR_PASSWORD_HASH").IsRequired();
                entity.Property(u => u.USR_NEW_PASSWORD_HASH).HasColumnName("USR_NEW_PASSWORD_HASH");
                entity.Property(u => u.USR_PHONE_NUMBER).HasColumnName("USR_PHONE_NUMBER").HasMaxLength(20);
                entity.Property(u => u.USR_CREATED_DATE).HasColumnName("USR_CREATED_DATE");
                entity.Property(u => u.USR_IS_ADMIN).HasColumnName("USR_IS_ADMIN");
                entity.Property(u => u.USR_DOCUMENT_TYPE).HasColumnName("USR_DOCUMENT_TYPE");
                entity.Property(u => u.USR_DOCUMENT_NUMBER).HasColumnName("USR_DOCUMENT_NUMBER");
                entity.Property(u => u.USR_PROVINCE).HasColumnName("USR_PROVINCE");
                entity.Property(u => u.USR_CITY).HasColumnName("USR_CITY");
                entity.Property(u => u.USR_POSTAL_CODE).HasColumnName("USR_POSTAL_CODE");
                entity.Property(u => u.USR_STREET).HasColumnName("USR_STREET");
                entity.Property(u => u.USR_STREET_NUMBER).HasColumnName("USR_STREET_NUMBER");
                entity.Property(u => u.USR_FLOOR).HasColumnName("USR_FLOOR");
                entity.Property(u => u.USR_APARTMENT).HasColumnName("USR_APARTMENT");
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("Products");
                entity.HasKey(e => e.PRD_ID);
                entity.Property(e => e.PRD_NAME).HasColumnName("PRD_NAME").HasMaxLength(100).IsRequired();
                entity.Property(e => e.PRD_PRICE).HasColumnName("PRD_PRICE").HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.PRD_IMAGE).HasColumnName("PRD_IMAGE").HasMaxLength(255);
                entity.Property(e => e.PRD_DESCRIPTION).HasColumnName("PRD_DESCRIPTION").HasMaxLength(1000);
                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Products)
                      .HasForeignKey(e => e.PRD_CAT_ID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("Categories");
                entity.HasKey(e => e.CAT_ID);
                entity.Property(e => e.CAT_NAME).HasColumnName("CAT_NAME").HasMaxLength(100).IsRequired();
            });

            modelBuilder.Entity<Cart>(entity =>
            {
                entity.ToTable("Cart");
                entity.HasKey(c => c.CAR_ID);
                entity.Property(c => c.CAR_USR_ID).HasColumnName("CAR_USR_ID").IsRequired();
                entity.HasOne(c => c.Users)
                      .WithMany()
                      .HasForeignKey(c => c.CAR_USR_ID)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasMany(c => c.Items)
                      .WithOne(i => i.Cart)
                      .HasForeignKey(i => i.CAI_CAR_ID)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CartItems>(entity =>
            {
                entity.ToTable("CartItems");
                entity.HasKey(i => i.CAI_ID);
                entity.Property(i => i.CAI_CAR_ID).HasColumnName("CAI_CAR_ID").IsRequired();
                entity.Property(i => i.CAI_PRD_ID).HasColumnName("CAI_PRD_ID").IsRequired();
                entity.Property(i => i.CAI_QUANTITY).HasColumnName("CAI_QUANTITY").IsRequired();
                entity.Property(i => i.CAI_TOTAL_PRICE).HasColumnName("CAI_TOTAL_PRICE").HasColumnType("decimal(18,2)").IsRequired();
                entity.HasOne(i => i.Product)
                      .WithMany()
                      .HasForeignKey(i => i.CAI_PRD_ID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configura la tabla Orders
            modelBuilder.Entity<Orders>(entity =>
            {
                entity.ToTable("Orders");
                entity.HasKey(o => o.ORD_ID);
                entity.Property(o => o.ORD_USR_ID).HasColumnName("ORD_USR_ID").IsRequired();
                entity.Property(o => o.ORD_ORDER_DATE).HasColumnName("ORD_ORDER_DATE").IsRequired();
                entity.Property(o => o.ORD_TOTAL_AMOUNT).HasColumnName("ORD_TOTAL_AMOUNT").HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(o => o.ORD_STATUS).HasColumnName("ORD_STATUS").HasMaxLength(50).IsRequired();
                entity.Property(o => o.ORD_PMT_ID).HasColumnName("ORD_PMT_ID").IsRequired();
                entity.HasOne(o => o.Users)
                      .WithMany()
                      .HasForeignKey(o => o.ORD_USR_ID)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(o => o.PaymentMethod)
                      .WithMany(p => p.Orders)
                      .HasForeignKey(o => o.ORD_PMT_ID)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasMany(o => o.OrderDetails)
                      .WithOne(d => d.Orders)
                      .HasForeignKey(d => d.ODD_ORD_ID)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.Property(o => o.ORD_DISCOUNT_AMOUNT).HasColumnType("decimal(18,2)").HasDefaultValue(0m);
                entity.HasOne(o => o.Discount)
                      .WithMany(d => d.Orders)
                      .HasForeignKey(o => o.ORD_DIS_ID)
                      .HasConstraintName("FK_Orders_Discounts_ORD_DIS_ID")
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configura la tabla OrderDetails
            modelBuilder.Entity<OrderDetails>(entity =>
            {
                entity.ToTable("OrderDetails");
                entity.HasKey(d => d.ODD_ID);
                entity.Property(d => d.ODD_ORD_ID).HasColumnName("ODD_ORD_ID").IsRequired();
                entity.Property(d => d.ODD_PRD_ID).HasColumnName("ODD_PRD_ID").IsRequired();
                entity.Property(d => d.ODD_QUANTITY).HasColumnName("ODD_QUANTITY").IsRequired();
                entity.Property(d => d.ODD_TOTAL_PRICE).HasColumnName("ODD_TOTAL_PRICE").HasColumnType("decimal(18,2)").IsRequired();
                entity.HasOne(d => d.Products)
                      .WithMany()
                      .HasForeignKey(d => d.ODD_PRD_ID)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.Orders)
                      .WithMany(o => o.OrderDetails)
                      .HasForeignKey(d => d.ODD_ORD_ID)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configura la tabla Payments
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("Payments");
                entity.HasKey(p => p.PAY_ID);
                entity.Property(p => p.PAY_ORD_ID).HasColumnName("PAY_ORD_ID").IsRequired();
                entity.Property(p => p.PAY_PAYMENT_DATE).HasColumnName("PAY_PAYMENT_DATE").IsRequired();
                entity.Property(p => p.PAY_AMOUNT).HasColumnName("PAY_AMOUNT").HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(p => p.PAY_STATUS).HasColumnName("PAY_STATUS").HasMaxLength(50).IsRequired();
                entity.Property(p => p.PAY_PAYMENT_REFERENCE).HasColumnName("PAY_PAYMENT_REFERENCE").HasMaxLength(100);
                entity.HasOne(p => p.Orders)
                      .WithMany()
                      .HasForeignKey(p => p.PAY_ORD_ID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configura la tabla PaymentMethods
            modelBuilder.Entity<PaymentMethod>(entity =>
            {
                entity.ToTable("PaymentMethod");
                entity.HasKey(p => p.PMT_ID);
                entity.Property(p => p.PMT_NAME).HasColumnName("PMT_NAME").HasMaxLength(100).IsRequired();
            });

            // Configura la tabla Recepits
            modelBuilder.Entity<Receipts>(entity =>
            {
                entity.ToTable("Receipts");
                entity.HasKey(r => r.RCP_ID);
                entity.Property(r => r.RCP_ORD_ID).HasColumnName("RCP_ORD_ID").IsRequired();
                entity.Property(r => r.RCP_PATH).HasColumnName("RCP_PATH").IsRequired();
                entity.Property(r => r.RCP_UPLOAD_DATE).HasColumnName("RCP_UPLOAD_DATE");
                entity.HasOne(r => r.Orders)
                      .WithOne(o => o.Receipt)
                      .HasForeignKey<Receipts>(r => r.RCP_ORD_ID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Discount>(entity =>
            {
                entity.ToTable("Discounts", t =>
                {
                    t.HasCheckConstraint("CK_Discounts_TYPE", "[DIS_TYPE] IN ('PERCENTAGE','FIXED')");
                    t.HasCheckConstraint("CK_Discounts_VALUE",
                        "[DIS_DISCOUNT] > 0 AND ([DIS_TYPE] <> 'PERCENTAGE' OR [DIS_DISCOUNT] <= 100)");
                });
                entity.HasKey(d => d.DIS_ID).HasName("PK_Discounts");
                entity.Property(d => d.DIS_CODE).HasMaxLength(50).IsRequired();
                entity.Property(d => d.DIS_NAME).HasMaxLength(100).IsRequired();
                entity.Property(d => d.DIS_TYPE).HasMaxLength(20).IsRequired();
                entity.Property(d => d.DIS_DISCOUNT).HasColumnType("decimal(18,2)");
                entity.Property(d => d.DIS_MIN_AMOUNT).HasColumnType("decimal(18,2)");
                entity.Property(d => d.DIS_USED_COUNT).HasDefaultValue(0);
                entity.Property(d => d.DIS_IS_ACTIVE).HasDefaultValue(true).ValueGeneratedNever();
                entity.HasIndex(d => d.DIS_CODE).IsUnique().HasDatabaseName("UQ_Discounts_CODE");
            });
        }
    }
}