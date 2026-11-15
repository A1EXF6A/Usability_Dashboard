using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IGeminiClient
    {
        Task<string> GenerateContentAsync(string prompt, string? userApiKey = null, string? systemInstruction = null);
    }
}
