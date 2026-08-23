using HesiasFleet.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace HesiasFleet.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<VehicleProperty> VehicleProperties => Set<VehicleProperty>();
    public DbSet<Part> Parts => Set<Part>();
    public DbSet<StockEntry> StockEntries => Set<StockEntry>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<Operation> Operations => Set<Operation>();
    public DbSet<MetaOperation> MetaOperations => Set<MetaOperation>();
    public DbSet<OperationConsumable> OperationConsumables => Set<OperationConsumable>();
    public DbSet<OperationSparePart> OperationSpareParts => Set<OperationSparePart>();
    public DbSet<Note> Notes => Set<Note>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Précision des montants monétaires (évite les warnings PostgreSQL/decimal)
        modelBuilder.Entity<StockEntry>()
            .Property(s => s.UnitCost).HasPrecision(10, 2);
        modelBuilder.Entity<StockMovement>()
            .Property(s => s.UnitCost).HasPrecision(10, 2);
        modelBuilder.Entity<OperationSparePart>()
            .Property(s => s.UnitCost).HasPrecision(10, 2);

        // Un email et un login uniques par utilisateur
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Login).IsUnique();

        // Quand une opération est supprimée, on ne veut pas casser la méta-op :
        // on détache l'opération plutôt que suppression en cascade
        modelBuilder.Entity<Operation>()
            .HasOne(o => o.MetaOperation)
            .WithMany(m => m.Operations)
            .HasForeignKey(o => o.MetaOperationId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}