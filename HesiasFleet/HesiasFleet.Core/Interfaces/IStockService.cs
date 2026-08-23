using HesiasFleet.Core.Entities;

namespace HesiasFleet.Core.Interfaces;

public interface IStockService
{
    Task<Part?> AddStockAsync(int partId, int quantity, decimal unitCost, int? userId = null);
    Task<bool> ConsumeStockAsync(int partId, int quantity, int? userId = null);
    Task<Part?> AdjustStockAsync(int partId, int newQuantity, int? userId = null);
    int GetAvailableQuantity(Part part);
}