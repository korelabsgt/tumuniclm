import React, { useState, useEffect } from "react";

const DataTable = ({
  data = [],
  availableCuatrimestres = [],
  selectedIndex = 0,
  onSelectPeriod = () => {},
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  // 🔹 Detectar si es móvil de forma reactiva
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const firstColWidth = isMobile ? "150px" : "180px";
  const columnWidth = isMobile ? "135px" : "155px";
  const tableFontSize = isMobile ? 12 : 13.5;

  const thStyle = {
    padding: isMobile ? "8px 6px" : "10px 12px",
    borderRight: "1px solid rgba(255,255,255,0.2)",
    borderBottom: "2px solid #004c99",
    background: "#0066cc",
    color: "#fff",
    fontWeight: "bold",
    width: columnWidth,
    minWidth: columnWidth,
    fontSize: isMobile ? 11.5 : 13,
    lineHeight: "1.3",
    textAlign: "center",
    wordWrap: "break-word",
  };

  const tdStyle = {
    padding: isMobile ? "7px 8px" : "9px 12px",
    borderBottom: "1px solid #e2e8f0",
    borderRight: "1px solid #f1f5f9",
    width: columnWidth,
    minWidth: columnWidth,
    textAlign: "center",
    wordWrap: "break-word",
    fontSize: tableFontSize,
  };

  // Usar los cuatrimestres disponibles o el fallback
  const cuatris =
    availableCuatrimestres && availableCuatrimestres.length > 0
      ? availableCuatrimestres
      : [{ id: 1, nombre: "Cuatrimestre", data }];

  // Recolectar todos los rubros/proyectos únicos preservando consistencia
  const itemsMap = new Map();

  cuatris.forEach((cuatri, cuatriIdx) => {
    (cuatri.data || []).forEach((item) => {
      if (!itemsMap.has(item.nombre)) {
        itemsMap.set(item.nombre, {
          nombre: item.nombre,
          presupuestado: item.presupuestado || 0,
          ejecuciones: {},
          totalEjecutado: item.totalEjecutado || 0,
        });
      }
      const entry = itemsMap.get(item.nombre);
      entry.ejecuciones[cuatriIdx] = item.ejecutado || 0;
      if (item.presupuestado && !entry.presupuestado) {
        entry.presupuestado = item.presupuestado;
      }
      if (item.totalEjecutado) {
        entry.totalEjecutado = item.totalEjecutado;
      }
    });
  });

  // Si no venía explícito el totalEjecutado, calcular la suma
  itemsMap.forEach((entry) => {
    if (!entry.totalEjecutado) {
      const sum = Object.values(entry.ejecuciones).reduce((a, b) => a + b, 0);
      if (sum > 0) entry.totalEjecutado = sum;
    }
  });

  // Filtrar elementos: quitar los que tengan 0 en presupuesto y 0 en todas las ejecuciones
  const allItems = Array.from(itemsMap.values()).filter(
    (item) =>
      (item.presupuestado || 0) > 0 ||
      (item.totalEjecutado || 0) > 0 ||
      Object.values(item.ejecuciones).some((v) => v > 0)
  );

  // Ordenar columnas por ejecución según el período seleccionado
  const sortedItems = [...allItems].sort((a, b) => {
    const valA =
      selectedIndex < cuatris.length
        ? a.ejecuciones[selectedIndex] || 0
        : a.totalEjecutado || 0;
    const valB =
      selectedIndex < cuatris.length
        ? b.ejecuciones[selectedIndex] || 0
        : b.totalEjecutado || 0;
    return (
      (valB || b.totalEjecutado || b.presupuestado) -
      (valA || a.totalEjecutado || a.presupuestado)
    );
  });

  // Construir filas con formato completo: Cuatrimestre 1 (Q.)
  const rows = [
    {
      id: "presupuesto",
      label: "Presupuesto (Q.)",
      isClickable: false,
      periodIndex: null,
      getValue: (item) => item.presupuestado,
    },
    ...cuatris.map((cuatri, idx) => {
      const num = cuatri.id || idx + 1;
      return {
        id: `cuatri-${idx}`,
        label: `Cuatrimestre ${num} (Q.)`,
        isClickable: true,
        periodIndex: idx,
        getValue: (item) => item.ejecuciones[idx] || 0,
      };
    }),
  ];

  if (sortedItems.some((item) => (item.totalEjecutado || 0) > 0)) {
    rows.push({
      id: "total",
      label: "Total Ejecutado (Q.)",
      isClickable: true,
      periodIndex: cuatris.length,
      getValue: (item) => item.totalEjecutado || 0,
    });
  }

  return (
    <div
      style={{
        width: "100%",
        marginTop: 16,
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <span
          style={{
            fontSize: isMobile ? "11.5px" : "12.5px",
            color: "#0369a1",
            backgroundColor: "#f0f9ff",
            padding: isMobile ? "5px 12px" : "6px 16px",
            borderRadius: "12px",
            border: "1px solid #bae6fd",
            display: "inline-block",
          }}
        >
          👆 <strong>Haz clic en una fila de cuatrimestre</strong> para actualizar la gráfica
        </span>
      </div>

      <div
        style={{
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            fontSize: tableFontSize,
            width: "max-content",
            minWidth: "100%",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: isMobile ? "8px 10px" : "10px 14px",
                  background: "#f1f5f9",
                  color: "#1e293b",
                  fontWeight: "700",
                  textAlign: "left",
                  width: firstColWidth,
                  minWidth: firstColWidth,
                  borderBottom: "2px solid #cbd5e1",
                  borderRight: "1px solid #e2e8f0",
                  fontSize: isMobile ? 12 : 13,
                }}
              >
                Período / Rubro
              </th>
              {sortedItems.map((item, i) => (
                <th key={i} style={thStyle}>
                  {item.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isSelected =
                row.isClickable && selectedIndex === row.periodIndex;
              const isHovered = row.isClickable && hoveredRow === row.id;

              const rowBg = isSelected
                ? "#e0f2fe"
                : isHovered
                ? "#f0f9ff"
                : i % 2 === 0
                ? "#ffffff"
                : "#f8fafc";

              return (
                <tr
                  key={row.id}
                  onClick={() =>
                    row.isClickable && onSelectPeriod(row.periodIndex)
                  }
                  onMouseEnter={() => row.isClickable && setHoveredRow(row.id)}
                  onMouseLeave={() => row.isClickable && setHoveredRow(null)}
                  style={{
                    cursor: row.isClickable ? "pointer" : "default",
                    transition: "all 0.15s ease",
                    backgroundColor: rowBg,
                  }}
                >
                  <td
                    style={{
                      ...tdStyle,
                      width: firstColWidth,
                      minWidth: firstColWidth,
                      textAlign: "left",
                      paddingLeft: isMobile ? "10px" : "14px",
                      paddingRight: isMobile ? "8px" : "12px",
                      fontWeight: isSelected ? "700" : "600",
                      background: isSelected ? "#bae6fd" : "#f8fafc",
                      color: isSelected ? "#0369a1" : "#1e293b",
                      borderLeft: isSelected
                        ? "4px solid #0284c7"
                        : "4px solid transparent",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.label}
                  </td>
                  {sortedItems.map((item, j) => {
                    const val = row.getValue(item) ?? 0;
                    return (
                      <td
                        key={j}
                        style={{
                          ...tdStyle,
                          background: isSelected ? "#f0f9ff" : rowBg,
                          fontWeight: isSelected ? "700" : "400",
                          color: isSelected ? "#0369a1" : "#1e293b",
                        }}
                      >
                        {val.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
