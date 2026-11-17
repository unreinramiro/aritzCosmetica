using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Aritz.Server.Models
{
    public class OrderDetails
    {
        [Key]
        public int ODD_ID { get; set; }
        public int ODD_ORD_ID { get; set; }
        [ForeignKey("ODD_ORD_ID")]
        public Orders? Orders { get; set; }
        public int ODD_PRD_ID { get; set; }
        [ForeignKey("ODD_PRD_ID")]
        public Product? Products { get; set; }
        public int ODD_QUANTITY { get; set; }
        public decimal ODD_UNIT_PRICE { get; set; }
        public decimal ODD_TOTAL_PRICE { get; set; }
    }
}
