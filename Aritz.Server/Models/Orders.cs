using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace Aritz.Server.Models
{
    public class Orders
    {
        [Key]
        public int ORD_ID { get; set; }
        public int ORD_USR_ID { get; set; }
        [ForeignKey("ORD_USR_ID")]
        public Users? Users { get; set; }
        public DateTime? ORD_ORDER_DATE { get; set; }
        public decimal? ORD_TOTAL_AMOUNT { get; set; }
        public string? ORD_STATUS { get; set; }
        public int ORD_PMT_ID { get; set; } // Nueva clave foránea
        [ForeignKey("ORD_PMT_ID")]
        public PaymentMethod? PaymentMethod { get; set; } // Relación con PaymentMethod
        public List<OrderDetails> OrderDetails { get; set; } = new List<OrderDetails>();
        public Receipts Receipt { get; set; }
        [Column("ORD_ZIP_CODE")] // Para que en la BD se llame exactamente así
        public string? ORD_ZIP_CODE { get; set; } // El signo ? permite nulos
    }
}