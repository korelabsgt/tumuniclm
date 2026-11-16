import React, { useState } from "react";
import { Tabs } from "antd";
import InformacionPublica from "./InformacionPublica";
import InformacionComude from "./InformacionComude";
import BarraInfo from "../barrainfo/BarraInfo";

const { TabPane } = Tabs;

const MenuInfo = () => {
  const [activeTab, setActiveTab] = useState("oficio");

  return (
    <div>
      {/* Barra superior con botón de volver */}
      <BarraInfo texto="Gobierno Abierto" />
      {/* Tabs de selección */}
      <Tabs
        style={{ marginTop: "3em" }}
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        centered
      >
        <TabPane tab="Información de Oficio" key="oficio">
          <InformacionPublica />
        </TabPane>
        <TabPane tab="Información del COMUDE" key="comude">
          <InformacionComude />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MenuInfo;
