using System.ComponentModel.DataAnnotations;

namespace Aritz.Server.Models
{
    public class Discount
    {
        [Key]
        public int DIS_ID { get; set; }
        public required string DIS_CODE { get; set; }
        public required string DIS_NAME { get; set; }
        public required string DIS_TYPE { get; set; } // "PERCENTAGE" | "FIXED"
        public decimal DIS_DISCOUNT { get; set; }
        public decimal? DIS_MIN_AMOUNT { get; set; }
        public DateTime DIS_START_DATE { get; set; }
        public DateTime? DIS_END_DATE { get; set; }
        public int? DIS_MAX_USES { get; set; }
        public int DIS_USED_COUNT { get; set; }
        public bool DIS_IS_ACTIVE { get; set; } = true;

        public ICollection<Orders> Orders { get; set; } = new List<Orders>();
    }
}