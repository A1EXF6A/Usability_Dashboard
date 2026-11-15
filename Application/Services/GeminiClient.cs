using Application.Interfaces;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class GeminiClient : IGeminiClient
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public GeminiClient(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<string> GenerateContentAsync(string prompt, string? userApiKey = null, string? systemInstruction = null)
        {
            var apiKey = userApiKey ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("No se ha configurado ninguna clave GEMINI_API_KEY.");
            }

            var model = Environment.GetEnvironmentVariable("GEMINI_MODEL");
            if (string.IsNullOrWhiteSpace(model))
            {
                model = "gemini-3.8-flash";
            }

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            object requestBody;
            if (!string.IsNullOrWhiteSpace(systemInstruction))
            {
                requestBody = new
                {
                    systemInstruction = new
                    {
                        parts = new[] { new { text = systemInstruction } }
                    },
                    contents = new[]
                    {
                        new
                        {
                            parts = new[] { new { text = prompt } }
                        }
                    },
                    generationConfig = new
                    {
                        responseMimeType = "application/json"
                    }
                };
            }
            else
            {
                requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[] { new { text = prompt } }
                        }
                    },
                    generationConfig = new
                    {
                        responseMimeType = "application/json"
                    }
                };
            }

            var client = _httpClientFactory.CreateClient("GeminiClient");
            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await client.PostAsync(url, content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(responseBody);

            var rawText = jsonDoc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrEmpty(rawText))
                throw new InvalidOperationException("El modelo de IA devolvió una respuesta vacía.");

            return rawText;
        }
    }
}
