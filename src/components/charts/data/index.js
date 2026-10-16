import { useState, useEffect } from "react";
import cuatrimestre1 from "./cuatrimestre1.json";
import cuatrimestre2 from "./cuatrimestre2.json";

// Lista ordenada cronológicamente de cuatrimestres disponibles
export const cuatrimestresList = [cuatrimestre1, cuatrimestre2];

// Estado compartido global para sincronizar el cuatrimestre en todas las gráficas a la vez
// Inicializa por defecto en Total Ejecutado (índice cuatrimestresList.length)
let sharedIndex = cuatrimestresList.length;
const listeners = new Set();

export const setSharedCuatrimestreIndex = (newIndex) => {
  // Permite índices de 0 hasta cuatrimestresList.length (donde el último es Total Ejecutado)
  const maxIndex = cuatrimestresList.length;
  const boundedIndex = Math.max(0, Math.min(maxIndex, newIndex));
  sharedIndex = boundedIndex;
  listeners.forEach((listener) => listener(boundedIndex));
};

export const getSharedCuatrimestreIndex = () => sharedIndex;

/**
 * Hook para compartir y sincronizar el índice del cuatrimestre en todas las gráficas a la vez.
 */
export const useSharedCuatrimestre = () => {
  const [index, setIndex] = useState(sharedIndex);

  useEffect(() => {
    const listener = (newIndex) => setIndex(newIndex);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  return [index, setSharedCuatrimestreIndex];
};

/**
 * Obtiene los datos de una política para todos los cuatrimestres disponibles.
 * @param {string} policyKey - Clave de la política (ej. 'politicas', 'educacion', etc.)
 * @returns {Array<{ id: number, nombre: string, periodo: string, año: number, data: Array }>}
 */
export const getCuatrimestresByPolicy = (policyKey) => {
  return cuatrimestresList.map((cuatri) => ({
    id: cuatri.id,
    nombre: cuatri.nombre,
    periodo: cuatri.periodo,
    año: cuatri.año,
    data: cuatri[policyKey] || [],
  }));
};

export default cuatrimestresList;
