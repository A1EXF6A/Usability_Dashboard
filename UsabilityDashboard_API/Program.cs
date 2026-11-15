
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using UsabilityDashboard_API.Extensions;
using UsabilityDashboard_API.Middlewares;

namespace UsabilityDashboard_API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Cargar variables de entorno desde el archivo .env si existe
            var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
            if (File.Exists(envPath))
            {
                foreach (var line in File.ReadAllLines(envPath))
                {
                    if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
                    var parts = line.Split('=', 2);
                    if (parts.Length == 2)
                    {
                        Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
                    }
                }
            }

            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();
            builder.Services.AddInfrastructure(builder.Configuration);
            builder.Services.AddApplication();
            builder.Services.AddSwaggerDocs();
            builder.Services.AddCorsPolicy();
            var app = builder.Build();

            // Aplicar migraciones de la base de datos al iniciar (habilitado con AUTO_MIGRATE=true)
            if (Environment.GetEnvironmentVariable("AUTO_MIGRATE") == "true")
            {
                Console.WriteLine("Applying database migrations...");
                int retryCount = 0;
                int maxRetries = 10;
                while (true)
                {
                    try
                    {
                        using var scope = app.Services.CreateScope();
                        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        dbContext.Database.Migrate();
                        Console.WriteLine("Database migrations applied.");
                        break;
                    }
                    catch (Exception ex)
                    {
                        retryCount++;
                        if (retryCount >= maxRetries)
                        {
                            Console.WriteLine($"Failed to apply migrations after {maxRetries} attempts: {ex.Message}");
                            throw;
                        }
                        Console.WriteLine($"Migration attempt {retryCount} failed: {ex.Message}. Retrying in 5s...");
                        Thread.Sleep(5000);
                    }
                }
            }

            // Configure the HTTP request pipeline.
            var isDocker = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Docker" ||
                           Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

            if (isDocker || app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseSwaggerDocs();
            }

            app.UseCors("DashboardPolicy");
            app.UseMiddleware<ExceptionMiddleware>();

            // Only use HTTPS redirection when not running in Docker
            if (!isDocker)
            {
                app.UseHttpsRedirection();
            }

            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}
