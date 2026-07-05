using Azure;
using Azure.AI.Inference;

public class ChatCompletionService
{
    private readonly ChatCompletionsClient _client;
    private readonly string _model;

    private ILogger<ChatCompletionsClient> _logger;

    public ChatCompletionService(IConfiguration config, ILogger<ChatCompletionsClient> logger)
    {
        _logger = logger;
        var endpoint = new Uri(config["AzureAI:Endpoint"]
            ?? throw new InvalidOperationException("AzureAI:Endpoint is not configured."));

        var key = new AzureKeyCredential(config["AzureAI:ApiKey"]
            ?? throw new InvalidOperationException("AzureAI:ApiKey is not configured."));

        _client = new ChatCompletionsClient(endpoint, key);

        _model = config["AzureAI:ChatCompletionDeployment"]
            ?? throw new InvalidOperationException("AzureAI:ChatCompletionDeployment is not configured.");
    }

    public async Task<string> GetChatCompletionAsync(string context, string query)
    {
        var options = new ChatCompletionsOptions
        {
            Messages =
            {
                new ChatRequestSystemMessage(context),
                new ChatRequestUserMessage(query)
            },
            Model = _model
        };

        var response = await _client.CompleteAsync(options);
        _logger.LogInformation("Chat completion response: {Response}", response.Value);
        return response.Value.Content.ToString() ?? "No response";
    }
}