import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const Trackprogress = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flexGrow: 1 }}>
        <Header />
        <div style={{ padding: "20px" }}>
          <h2>1</h2>
        </div>
      </div>
    </div>
  );
};

export default Trackprogress;
