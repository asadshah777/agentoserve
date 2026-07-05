using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddedVectorEmbeddingsTableFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_DocumentEmbeddings_ProjectId",
                table: "DocumentEmbeddings",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentEmbeddings_Projects_ProjectId",
                table: "DocumentEmbeddings",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DocumentEmbeddings_Projects_ProjectId",
                table: "DocumentEmbeddings");

            migrationBuilder.DropIndex(
                name: "IX_DocumentEmbeddings_ProjectId",
                table: "DocumentEmbeddings");
        }
    }
}
