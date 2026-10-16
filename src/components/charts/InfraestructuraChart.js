import React from "react";
import Charts from "./Charts";
import ImageCarousel from "./ImageCarousel"; // 🔹 Importamos el nuevo componente

const InfraestructuraChart = () => {
  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <Charts
        description="La política de <b><span style='color: #06c;'>#Infraestructura🏗️</span></b> 
        permite mejorar la <b>calidad de vida</b> de nuestra comunidad. A través de obras que fortalecen nuestros servicios, 
        impulsan el desarrollo y crean oportunidades, construimos un entorno más <b>seguro</b>, <b>funcional</b> y <b>sostenible</b> para todos."
        policyKey="infraestructura"
        chartFontSizeX={window.innerWidth < 768 ? 14 : 25}
        chartFontSizeY={window.innerWidth < 768 ? 14 : 16}
        chartHeight={window.innerWidth < 768 ? "500px" : "600px"}
        chartCanvasWidth={window.innerWidth < 768 ? "350px" : "200px"}
      />
      {/* 🔹 Llamamos al nuevo componente y le mandamos los números de inicio y fin */}
      <ImageCarousel start={54} end={64} />
    </div>
  );
};

export default InfraestructuraChart;
