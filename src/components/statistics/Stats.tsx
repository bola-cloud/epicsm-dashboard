import React from "react";
import WorldMap from "../Maps/MapOne";
import VersionChart from "./VersionChart";
import WebVersionChart from "./WebVersionChart";
import ConnectivityChart from "./ConnectivityChart";

function Stats() {
  return (
    <div>
      <WorldMap />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 my-4">
        <VersionChart />
        <WebVersionChart />
        <ConnectivityChart />
      </div>
    </div>
  );
}

export default Stats;
