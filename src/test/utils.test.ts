import { describe, it, expect } from 'vitest';


const getInitials = (text: string) => {
  if (!text) return "---";
  const cleanText = text
    .replace(/\s*[([].*?[)\]]/g, "")
    .replace(/\s+(feat\.?|ft\.?|featuring)\s+.*/i, "")
    .replace(/\s+-\s+.*/, "")
    .trim();

  return cleanText
    .split(" ")
    .map((word) => {
      const match = word.match(/[a-zA-Z0-9]/);
      return match ? match[0].toUpperCase() : "";
    })
    .filter((char) => char !== "")
    .join(".");
};

describe('Utilidades: getInitials', () => {
  it('debería devolver las iniciales básicas correctamente', () => {
    expect(getInitials('Bad Bunny')).toBe('B.B');
    expect(getInitials('Rosalía')).toBe('R');
  });

  it('debería ignorar el texto entre paréntesis (remixes, versiones)', () => {
    expect(getInitials('Despacito (Remix)')).toBe('D');
    expect(getInitials('Bzrp Music Sessions [Vol. 53]')).toBe('B.M.S');
  });

  it('debería limpiar las colaboraciones (feat, ft.)', () => {
    expect(getInitials('Rauw Alejandro feat. Shakira')).toBe('R.A');
    expect(getInitials('Duki ft Bizarrap')).toBe('D');
    expect(getInitials('Quevedo featuring Myke Towers')).toBe('Q');
  });

  it('debería limpiar subtítulos después de un guion', () => {
    expect(getInitials('Tití Me Preguntó - Live at Choliseo')).toBe('T.M.P');
  });

  it('debería devolver "---" si no recibe texto', () => {
    expect(getInitials('')).toBe('---');
  });
});