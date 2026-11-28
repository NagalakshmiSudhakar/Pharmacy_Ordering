using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyOrderingAPI.Services;
using PharmacyOrderingAPI.DTOs;
using PharmacyOrderingAPI.Services.Interfaces;

namespace PharmacyOrderingAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MedicinesController : ControllerBase
{
    private readonly IMedicineService _service;

    public MedicinesController(IMedicineService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var medicine = await _service.GetByIdAsync(id);

        if (medicine == null)
            return NotFound("Medicine not found.");

        return Ok(medicine);
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest("Medicine name is required.");

        return Ok(await _service.SearchAsync(name));
    }

    [HttpGet("category/{category}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByCategory(string category)
    {
        return Ok(await _service.GetByCategoryAsync(category));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateMedicineDto dto)
    {
        var medicine = await _service.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = medicine.MedicineId },
            medicine);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        int id,
        UpdateMedicineDto dto)
    {
        var medicine = await _service.UpdateAsync(id, dto);

        if (medicine == null)
            return NotFound("Medicine not found.");

        return Ok(medicine);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var result = await _service.DeactivateAsync(id);

        if (!result)
            return NotFound("Medicine not found.");

        return Ok("Medicine deactivated successfully.");
    }
}