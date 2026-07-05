using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddFileIdToEmbeddings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FileId",
                table: "DocumentEmbeddings",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentEmbeddings_FileId",
                table: "DocumentEmbeddings",
                column: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentEmbeddings_UserUploads_FileId",
                table: "DocumentEmbeddings",
                column: "FileId",
                principalTable: "UserUploads",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DocumentEmbeddings_UserUploads_FileId",
                table: "DocumentEmbeddings");

            migrationBuilder.DropIndex(
                name: "IX_DocumentEmbeddings_FileId",
                table: "DocumentEmbeddings");

            migrationBuilder.DropColumn(
                name: "FileId",
                table: "DocumentEmbeddings");
        }
    }
}
