
using Microsoft.EntityFrameworkCore;
using PharmacyOrderingAPI.Data;
using PharmacyOrderingAPI.Models;
using PharmacyOrderingAPI.Repository.Interfaces;
namespace PharmacyOrderingAPI.Repository;

public class MedicineRepository : IMedicineRepository
{
	private readonly ApplicationDbContext _context;

	public MedicineRepository(ApplicationDbContext context)
	{
		_context = context;
	}

	public async Task<List<Medicine>> GetAllAsync()
	{
		return await _context.Medicines
			.Where(m => m.IsActive)
			.ToListAsync();
	}

	public async Task<Medicine?> GetByIdAsync(int id)
	{
		return await _context.Medicines
			.FirstOrDefaultAsync(m => m.MedicineId == id);
	}

	public async Task<List<Medicine>> SearchAsync(string name)
	{
		return await _context.Medicines
			.Where(m => m.IsActive && m.Name.Contains(name))
			.ToListAsync();
	}

	public async Task<List<Medicine>> GetByCategoryAsync(string category)
	{
		return await _context.Medicines
			.Where(m => m.IsActive && m.Category == category)
			.ToListAsync();
	}

	public async Task AddAsync(Medicine medicine)
	{
		await _context.Medicines.AddAsync(medicine);
		await _context.SaveChangesAsync();
	}

	public async Task UpdateAsync(Medicine medicine)
	{
		_context.Medicines.Update(medicine);
		await _context.SaveChangesAsync();
	}
}
