using Aritz.Server.Data;
using Aritz.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. LEER EL TOKEN (Busca en appsettings y en user-secrets automáticamente)
var mpAccessToken = builder.Configuration["MercadoPago:AccessToken"];

if (string.IsNullOrEmpty(mpAccessToken))
{
    // Esto te avisará apenas inicies la app si falta la clave, en lugar de fallar cuando alguien paga.
    throw new Exception("¡Falta el AccessToken de MercadoPago! Revisa tus User Secrets.");
}

Console.WriteLine($"Access Toekn: '{mpAccessToken}'");

// 2. CONFIGURAR MERCADOPAGO GLOBALMENTE
MercadoPago.Config.MercadoPagoConfig.AccessToken = mpAccessToken;


// --- CÓDIGO TEMPORAL DE DEBUG (BORRAR DESPUÉS) ---
var connString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"Cadena leída: '{connString}'");

// Configura CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", builder =>
    {
        builder.WithOrigins("https://localhost:50833")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

// Configura el DbContext con la cadena de conexión
builder.Services.AddDbContext<AritzDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure()
    ).LogTo(Console.WriteLine, LogLevel.Information));

// Configura autenticación con JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

// Agrega servicios para controladores con System.Text.Json
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.WriteIndented = true; // Opcional: para JSON legible
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
    });

// Agrega soporte explícito para JSON
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

// Agrega servicios para Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => { c.CustomSchemaIds(type => type.ToString()); });

builder.Services.AddTransient<IEmailService, EmailService>();

builder.Services.AddHostedService<OrderCleanupService>();

var app = builder.Build();

// Configura el pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();