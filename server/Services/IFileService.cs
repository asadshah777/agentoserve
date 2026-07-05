public interface IFileService
{
    Task<string> UploadFileAsync(IFormFile file, string folder = "uploads");
    Task<bool> DeleteFileAsync(string filePath);

    //extract pdf text
    Task<string> ExtractTextFromPdfAsync(string filePath);
}
