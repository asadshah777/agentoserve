using Azure;
using Azure.AI.Inference;
using Pgvector;

public class EmbeddingService
{
    private readonly EmbeddingsClient _client;
    private readonly string _deployment;

    public EmbeddingService(IConfiguration config)
    {
        var endpoint = new Uri(config["AzureAI:Endpoint"]
            ?? throw new InvalidOperationException("AzureAI:Endpoint is not configured."));
        var key = new AzureKeyCredential(config["AzureAI:ApiKey"]
            ?? throw new InvalidOperationException("AzureAI:ApiKey is not configured."));

        _client = new EmbeddingsClient(endpoint, key);
        _deployment = config["AzureAI:EmbeddingDeployment"]
            ?? throw new InvalidOperationException("AzureAI:EmbeddingDeployment is not configured.");
    }

    public async Task<float[]> GenerateEmbeddingAsync(string text)
    {
        // Wrap the single string in IEnumerable<string>
        var options = new EmbeddingsOptions(new[] { text })
        {
            Model = _deployment
        };

        var response = await _client.EmbedAsync(options);

        var embed = response.Value.Data[0].Embedding;

        return embed.ToObjectFromJson<float[]>();
    }
}