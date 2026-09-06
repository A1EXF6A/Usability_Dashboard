namespace UsabilityDashboard_API.Extensions;

public static class CorsExtensions
{
    public static IServiceCollection AddCorsPolicy(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("DashboardPolicy", policy =>
            {
                if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Docker")
                {
                    // In Docker, allow all origins for simplicity
                    policy
                        .AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                }
                else
                {
                    // Development/Production origins
                    policy
                        .WithOrigins(
                            "http://localhost:3000",   // React
                            "http://localhost:4200",   // Angular
                            "http://localhost:5173",   // Vite
                            "http://localhost:5000",   // Frontend container
                            "http://frontend:80"       // Docker internal
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                }
            });
        });

        return services;
    }
}