import React from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const MonitorMaterials = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flexGrow: 1 }}>
        <Header />
        <div style={{ padding: "20px" }}>
          <h2>2</h2>
        </div>
      </div>
    </div>
  );
};

export default MonitorMaterials;
