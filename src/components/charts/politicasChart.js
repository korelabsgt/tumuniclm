import React from "react";
import Charts from "./Charts";

const PoliticasChart = () => {
  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <Charts
        description="Las <b>Políticas Públicas</b> a nivel municipal, son las <b>Acciones</b> del Gobierno Local, que tienen como propósito alcanzar <b>objetivos de interés público</b>, que permiten la solución de <b>conflictos y problemáticas</b> locales además de ser elementos que mejoran la <b>transparencia</b> de la gestión pública Municipal."
        policyKey="politicas"
        chartFontSizeX={window.innerWidth < 768 ? 14 : 25}
        chartFontSizeY={window.innerWidth < 768 ? 14 : 16}
        chartHeight={window.innerWidth < 768 ? "500px" : "600px"}
        chartCanvasWidth={window.innerWidth < 768 ? "350px" : "200px"}
      />
      {/* 🔹 Llamamos al nuevo componente y le mandamos los números de inicio y fin */}
    </div>
  );
};

export default PoliticasChart;
