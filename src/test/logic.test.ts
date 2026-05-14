import { describe, it, expect } from 'vitest';

const checkArtistMatch = (userArtist: string, targetArtist: string): boolean => {
  if (userArtist.toLowerCase().trim() === targetArtist.toLowerCase().trim()) return true;
  const normalizeAndSplit = (str: string) => {
    return str
      .toLowerCase()
      .replace(/ feat\.? | ft\.? | & | y | x | \+ /gi, ",")
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
  };
  const userParts = normalizeAndSplit(userArtist);
  const targetParts = normalizeAndSplit(targetArtist);
  return userParts.some((userPart) => targetParts.includes(userPart));
};

describe('Lógica de validación de artistas', () => {
  it('debería aceptar coincidencias exactas ignorando mayúsculas', () => {
    expect(checkArtistMatch('Bad Bunny', 'bad bunny')).toBe(true);
  });

  it('debería detectar un artista dentro de una colaboración (feat)', () => {
    expect(checkArtistMatch('Shakira', 'Shakira ft. Bizarrap')).toBe(true);
    expect(checkArtistMatch('Bizarrap', 'Shakira ft. Bizarrap')).toBe(true);
  });

  it('debería fallar si el artista es totalmente distinto', () => {
    expect(checkArtistMatch('Rosalía', 'Rauw Alejandro')).toBe(false);
  });
});