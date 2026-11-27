using PharmacyOrderingAPI.Models;

namespace PharmacyOrderingAPI.Repository.Interfaces;

public interface IMedicineRepository
{
	Task<List<Medicine>> GetAllAsync();

	Task<Medicine?> GetByIdAsync(int id);

	Task<List<Medicine>> SearchAsync(string name);

	Task<List<Medicine>> GetByCategoryAsync(string category);

	Task AddAsync(Medicine medicine);

	Task UpdateAsync(Medicine medicine);
}