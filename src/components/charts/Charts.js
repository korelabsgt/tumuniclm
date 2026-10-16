import React from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import DataTable from "./DataTable";
import cuatrimestre1 from "./data/cuatrimestre1.json";
import cuatrimestre2 from "./data/cuatrimestre2.json";

// Cuatrimestres disponibles
const allCuatrimestres = [cuatrimestre1, cuatrimestre2];

const getCuatrimestresByPolicy = (policyKey) => {
  return allCuatrimestres.map((cuatri) => ({
    id: cuatri.id,
    nombre: cuatri.nombre,
    periodo: cuatri.periodo,
    año: cuatri.año,
    data: cuatri[policyKey] || [],
  }));
};

// Sincronización global del período activo entre todas las gráficas
// Por defecto siempre seleccionado 'Total Ejecutado' (índice igual a la cantidad de cuatrimestres)
let globalSharedIndex = allCuatrimestres.length;
const globalListeners = new Set();

const useSharedCuatrimestre = () => {
  const [index, setIndex] = React.useState(globalSharedIndex);

  React.useEffect(() => {
    const listener = (newIndex) => setIndex(newIndex);
    globalListeners.add(listener);
    return () => globalListeners.delete(listener);
  }, []);

  const updateIndex = (newIndex) => {
    globalSharedIndex = newIndex;
    globalListeners.forEach((listener) => listener(newIndex));
  };

  return [index, updateIndex];
};

// Presupuesto general oficial por política según tablas de presupuesto (fijo e idéntico en todos los períodos)
const generalPresupuestoByPolicy = {
  educacion: 4697250.0,
  redVial: 16070450.0,
  salud: 657000.0,
  seguridad: 1146000.0,
  desarrollo: 2549000.0,
  medioAmbiente: 1987500.0,
  servicios: 6963500.0,
  asistenciaTecnica: 534000.0,
  dmp: 534000.0,
  infraestructura: 2469500.0,
  politicas: 46983000.0,
};

const Charts = ({
  description,
  data,
  cuatrimestres,
  policyKey,
  chartHeight = "500px",
}) => {
  // 🔹 Detectar si es móvil de forma reactiva
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fontSizeX = isMobile ? 10 : 14;
  const fontSizeY = isMobile ? 10 : 14;

  // Determinar la lista de cuatrimestres disponibles
  const availableCuatrimestres =
    cuatrimestres ||
    (policyKey ? getCuatrimestresByPolicy(policyKey) : null) ||
    (data ? [{ id: 1, nombre: "1er. Cuatrimestre 2026", data }] : []);

  // Períodos disponibles para visualizar en la gráfica:
  // 1) Cada cuatrimestre individual
  // 2) Vista de Total Ejecutado acumulado
  const periods = [
    ...availableCuatrimestres.map((c, i) => ({
      id: i,
      nombre: c.nombre,
      isTotal: false,
      data: c.data || [],
    })),
  ];

  const lastCuatriData =
    availableCuatrimestres[availableCuatrimestres.length - 1]?.data || [];
  if (lastCuatriData.some((item) => (item.totalEjecutado || 0) > 0)) {
    periods.push({
      id: availableCuatrimestres.length,
      nombre: "Total Ejecutado 2026",
      isTotal: true,
      data: lastCuatriData.map((item) => ({
        ...item,
        ejecutado:
          item.totalEjecutado !== undefined
            ? item.totalEjecutado
            : item.ejecutado,
      })),
    });
  }

  // Cuatrimestre sincronizado globalmente entre todas las gráficas
  const [sharedIndex, setSharedIndex] = useSharedCuatrimestre();
  const currentIndex = Math.max(0, Math.min(periods.length - 1, sharedIndex));

  const activePeriod = periods[currentIndex] || periods[0];

  // 🔹 Filtrar solo los que tengan ejecutado > 0 en este período
  const currentData = (activePeriod.data || []).filter(
    (item) => (item.ejecutado || 0) > 0
  );

  // Ordenar datos por ejecución de mayor a menor
  const sortedData = [...currentData].sort((a, b) => b.ejecutado - a.ejecutado);

  // Presupuesto general oficial: fijo e idéntico en todos los períodos
  const generalPresupuestado =
    policyKey && generalPresupuestoByPolicy[policyKey] !== undefined
      ? generalPresupuestoByPolicy[policyKey]
      : (availableCuatrimestres[0]?.data || []).reduce(
          (sum, item) => sum + (item.presupuestado || 0),
          0
        );
  const totalEjecutado = sortedData.reduce(
    (sum, item) => sum + (item.ejecutado || 0),
    0
  );

  // Definir dimensiones para PC (pantalla grande)
  const barWidth = 100; // 🔹 Ancho fijo por barra en desktop
  const chartCanvasWidth = `${Math.max(600, sortedData.length * barWidth * 3)}px`;

  // Valor máximo para calcular el ancho proporcional de las barras en móvil
  const maxVal = Math.max(
    1,
    ...sortedData.map((item) =>
      Math.max(item.presupuestado || 0, item.ejecutado || 0)
    )
  );

  const chartData = {
    labels: sortedData.map((item) => item.nombre),
    datasets: [
      {
        label: "Presupuestado",
        data: sortedData.map((item) => item.presupuestado),
        backgroundColor: "#06cc", // Siempre azul (estilo de barras móvil)
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
        barThickness: barWidth * 0.8, // Grosor uniforme original en PC
      },
      {
        label: activePeriod.isTotal ? "Total Ejecutado" : "Ejecutado",
        data: sortedData.map((item) => item.ejecutado),
        backgroundColor: "#0cfc", // Siempre celeste (estilo de barras móvil)
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
        barThickness: barWidth * 0.8, // Grosor uniforme original en PC
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          font: { size: fontSizeX },
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
        },
        categoryPercentage: 0.9,
        barPercentage: 0.8,
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: fontSizeY },
          callback: (value) =>
            `Q${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
        },
      },
    },
    plugins: {
      legend: { labels: { font: { size: fontSizeX } } },
    },
  };

  return (
    <div style={{ width: "100%", margin: "0 auto", textAlign: "center" }}>
      {/* 📌 Indicador del período visualizado (se cambia seleccionando una fila en la tabla) */}
      {availableCuatrimestres.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "1.2em",
            marginBottom: "0.8em",
          }}
        >
          <div
            style={{
              padding: "8px 24px",
              backgroundColor: "#f0f7ff",
              borderRadius: "20px",
              border: "1.5px solid #0284c7",
              minWidth: "220px",
              textAlign: "center",
              boxShadow: "0 2px 5px rgba(2, 132, 199, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "1.1em" }}>📊</span>
            <span
              style={{
                fontSize: "1.05em",
                fontWeight: "700",
                color: "#02245b",
                letterSpacing: "0.3px",
              }}
            >
              {activePeriod.nombre}
            </span>
          </div>
        </div>
      )}

      {/* Descripción */}
      <p
        style={{
          marginTop: "1em",
          fontSize: isMobile ? "1em" : "1em",
        }}
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {/* Totales */}
      <div
        style={{
          marginTop: "1em",
          fontSize: isMobile ? "1em" : "1em",
          textAlign: "right",
          marginRight: "1em",
        }}
      >
        <p>
          <strong>Presupuestado:</strong> <br />Q{" "}
          {generalPresupuestado.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          <br />
          <strong>Total ejecutado:</strong> <br />Q{" "}
          {totalEjecutado.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* 📌 Gráfico: En móvil barras horizontales con el nombre ARRIBA de las barras. En PC: Gráfica Chart.js normal */}
      {isMobile ? (
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            margin: "0 auto",
            padding: "10px 12px 20px 12px",
            boxSizing: "border-box",
          }}
        >
          {/* Leyenda general arriba */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              marginBottom: "16px",
              paddingBottom: "8px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  backgroundColor: "#06cc",
                  borderRadius: "3px",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b" }}>
                Presupuestado
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  backgroundColor: "#0cfc",
                  borderRadius: "3px",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b" }}>
                {activePeriod.isTotal ? "Total Ejecutado" : "Ejecutado"}
              </span>
            </div>
          </div>

          {/* Barras por cada rubro con su leyenda ARRIBA de las barras */}
          {sortedData.map((item, idx) => {
            const pctPresup = Math.min(
              100,
              Math.max(0, ((item.presupuestado || 0) / maxVal) * 100)
            );
            const pctEjec = Math.min(
              100,
              Math.max(0, ((item.ejecutado || 0) / maxVal) * 100)
            );

            return (
              <div
                key={idx}
                style={{
                  marginBottom: "20px",
                  textAlign: "left",
                }}
              >
                {/* 🔹 Leyenda/Nombre del rubro ARRIBA de las barras */}
                <div
                  style={{
                    fontSize: "13.5px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "7px",
                    lineHeight: "1.35",
                  }}
                >
                  {item.nombre}
                </div>

                {/* Barra Presupuestado (Azul) - Ancha */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "5px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "24px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pctPresup}%`,
                        minWidth: (item.presupuestado || 0) > 0 ? "4px" : "0px",
                        height: "100%",
                        backgroundColor: "#06cc",
                        borderRadius: "6px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      minWidth: "95px",
                      textAlign: "right",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#0066cc",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Q {(item.presupuestado || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Barra Ejecutado (Celeste) - Ancha */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "24px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pctEjec}%`,
                        minWidth: (item.ejecutado || 0) > 0 ? "4px" : "0px",
                        height: "100%",
                        backgroundColor: "#0cfc",
                        borderRadius: "6px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      minWidth: "95px",
                      textAlign: "right",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#00b4d8",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Q {(item.ejecutado || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 📌 En PC: Gráfica normal Chart.js con scroll horizontal y barras con bordes redondeados */
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            paddingBottom: "20px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div
            style={{
              width: chartCanvasWidth,
              height: chartHeight,
              minWidth: "600px",
              margin: "0 auto",
            }}
          >
            <Bar data={chartData} options={options} />
          </div>
        </div>
      )}

      {/* 📌 Tabla interactiva con todos los cuatrimestres (al hacer clic en una fila se actualiza la gráfica) */}
      <DataTable
        availableCuatrimestres={availableCuatrimestres}
        data={sortedData}
        selectedIndex={currentIndex}
        onSelectPeriod={setSharedIndex}
      />
    </div>
  );
};

export default Charts;
