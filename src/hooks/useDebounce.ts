import { useState, useEffect } from "react";

/**
 * Retrasa la actualización de un valor hasta que haya pasado un tiempo determinado.
 * @param value El valor que queremos observar (ej: el texto del buscador)
 * @param delay El tiempo de espera en milisegundos (ej: 500)
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Estado para guardar el valor con retraso
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configuramos un temporizador para actualizar el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // La función de limpieza (cleanup) es la magia del debounce.
    // Si el 'value' cambia ANTES de que termine el 'delay', 
    // React ejecuta esta limpieza, cancela el temporizador anterior y empieza uno nuevo.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se vuelve a ejecutar si cambia el valor o el tiempo

  return debouncedValue;
}