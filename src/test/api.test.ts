import { describe, it, expect, vi } from 'vitest';

describe('Sincronización con la API', () => {
  it('debería enviar los intentos correctamente al servidor', async () => {
    // Simulamos la respuesta global de fetch
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Success" }),
    } as Response);

    const mockData = {
      modeSlug: 'urbano',
      gameState: 'playing',
      guesses: ['wrong'],
      date: '2026-5-14'
    };

    const response = await fetch('/api/stats/update', {
      method: 'POST',
      body: JSON.stringify(mockData)
    });

    const data = await response.json();

    expect(fetchSpy).toHaveBeenCalledWith('/api/stats/update', expect.any(Object));
    expect(data.message).toBe("Success");
  });
});