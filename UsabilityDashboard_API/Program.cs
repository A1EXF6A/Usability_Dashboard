
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
