using Aritz.Server.Data;
using Microsoft.EntityFrameworkCore;

public class OrderCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OrderCleanupService> _logger;

    public OrderCleanupService(IServiceProvider serviceProvider, ILogger<OrderCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Servicio de limpieza de órdenes iniciado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AritzDbContext>();

                var transferLimit = DateTime.UtcNow.AddHours(-48);
                var abandonedLimit = DateTime.UtcNow.AddHours(-24);

                var ordersToCancel = await context.Orders
                    .Include(o => o.OrderDetails)
                    .Where(o =>
                        // Transferencia pendiente de más de 48 h y sin comprobante
                        (o.ORD_STATUS == "Pendiente"
                            && o.ORD_PMT_ID == 2
                            && o.ORD_ORDER_DATE < transferLimit
                            && !context.Receipts.Any(r => r.RCP_ORD_ID == o.ORD_ID))
                        ||
                        // Pago online abandonado (nunca llegó el webhook)
                        (o.ORD_STATUS == "Iniciada"
                            && o.ORD_ORDER_DATE < abandonedLimit))
                    .ToListAsync(stoppingToken);

                if (ordersToCancel.Count > 0)
                {
                    // Un solo query para todos los productos involucrados
                    var productIds = ordersToCancel
                        .SelectMany(o => o.OrderDetails)
                        .Select(d => d.ODD_PRD_ID)
                        .Distinct()
                        .ToList();

                    var products = await context.Products
                        .Where(p => productIds.Contains(p.PRD_ID))
                        .ToDictionaryAsync(p => p.PRD_ID, stoppingToken);

                    foreach (var order in ordersToCancel)
                    {
                        order.ORD_STATUS = "Cancelado";

                        foreach (var d in order.OrderDetails)
                        {
                            if (!products.TryGetValue(d.ODD_PRD_ID, out var p)) continue;
                            if (p.PRD_QUANTITY <= 0) p.PRD_IS_ACTIVE = true; // se había desactivado por falta de stock
                            p.PRD_QUANTITY += d.ODD_QUANTITY;
                        }
                    }

                    await context.SaveChangesAsync(stoppingToken); // estados + stock, todo junto
                    _logger.LogInformation("Se cancelaron automáticamente {Count} órdenes vencidas.", ordersToCancel.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al ejecutar la limpieza de órdenes.");
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}