using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class UserApiKey
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public string KeyName { get; set; } = string.Empty;

    [Required]
    public string KeyValue { get; set; } = string.Empty;
}
