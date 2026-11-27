using PharmacyOrderingAPI.DTOs;
using PharmacyOrderingAPI.Models;
using PharmacyOrderingAPI.Repository.Interfaces;
using PharmacyOrderingAPI.Services.Interfaces;

namespace PharmacyOrderingAPI.Services;

public class MedicineService : IMedicineService
{
    private readonly IMedicineRepository _repository;

    public MedicineService(IMedicineRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<MedicineResponseDto>> GetAllAsync()
    {
        var medicines = await _repository.GetAllAsync();

        return medicines.Select(MapToDto).ToList();
    }

    public async Task<MedicineResponseDto?> GetByIdAsync(int id)
    {
        var medicine = await _repository.GetByIdAsync(id);

        if (medicine == null || !medicine.IsActive)
            return null;

        return MapToDto(medicine);
    }

    public async Task<List<MedicineResponseDto>> SearchAsync(string name)
    {
        var medicines = await _repository.SearchAsync(name);

        return medicines.Select(MapToDto).ToList();
    }

    public async Task<List<MedicineResponseDto>> GetByCategoryAsync(string category)
    {
        var medicines = await _repository.GetByCategoryAsync(category);

        return medicines.Select(MapToDto).ToList();
    }

    public async Task<MedicineResponseDto> CreateAsync(CreateMedicineDto dto)
    {
        var medicine = new Medicine
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            ImageUrl = dto.ImageUrl,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(medicine);

        return MapToDto(medicine);
    }

    public async Task<MedicineResponseDto?> UpdateAsync(
        int id,
        UpdateMedicineDto dto)
    {
        var medicine = await _repository.GetByIdAsync(id);

        if (medicine == null || !medicine.IsActive)
            return null;

        medicine.Name = dto.Name;
        medicine.Description = dto.Description;
        medicine.Category = dto.Category;
        medicine.Price = dto.Price;
        medicine.StockQuantity = dto.StockQuantity;
        medicine.ImageUrl = dto.ImageUrl;

        await _repository.UpdateAsync(medicine);

        return MapToDto(medicine);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var medicine = await _repository.GetByIdAsync(id);

        if (medicine == null || !medicine.IsActive)
            return false;

        medicine.IsActive = false;

        await _repository.UpdateAsync(medicine);

        return true;
    }

    private static MedicineResponseDto MapToDto(Medicine medicine)
    {
        return new MedicineResponseDto
        {
            MedicineId = medicine.MedicineId,
            Name = medicine.Name,
            Description = medicine.Description,
            Category = medicine.Category,
            Price = medicine.Price,
            StockQuantity = medicine.StockQuantity,
            ImageUrl = medicine.ImageUrl,
            IsActive = medicine.IsActive
        };
    }
}