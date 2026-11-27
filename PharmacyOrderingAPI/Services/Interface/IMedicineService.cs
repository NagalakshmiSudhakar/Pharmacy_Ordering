
using PharmacyOrderingAPI.DTOs;

namespace PharmacyOrderingAPI.Services.Interfaces;


public interface IMedicineService
{
	Task<List<MedicineResponseDto>> GetAllAsync();
	Task<MedicineResponseDto?> GetByIdAsync(int id);
	Task<List<MedicineResponseDto>> SearchAsync(string name);
	Task<List<MedicineResponseDto>> GetByCategoryAsync(string category);
	Task<MedicineResponseDto> CreateAsync(CreateMedicineDto dto);
	Task<MedicineResponseDto?> UpdateAsync(int id, UpdateMedicineDto dto);
	Task<bool> DeactivateAsync(int id);
}
