"use client";

import API from "@/utils/API";
import { NAME_TO_COUNTRY } from "@/utils/Countries";
import React, { useState, useMemo, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

interface CountryStatistic {
  country: string;
  value: number;
}

const WorldMap = () => {
  const [statistics, setStatistics] = useState<CountryStatistic[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get("/api/v2/stats/country");
        setStatistics(response.data.statistics);
        setTotalUsers(response.data.totalUsers);
      } catch (error) {
        console.error("Error fetching country statistics:", error);
      }
    };
    fetchData();
  }, []);

  const [tooltip, setTooltip] = useState({
    content: "",
    x: 0,
    y: 0,
    show: false,
  });

  const geoUrl = useMemo(
    () => "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
    [],
  );

  const getColorScale = (value: number) => {
    if (!value || value === 0) return "#e5e7eb";
    const baseColor = [59, 130, 246];
    const maxUsers = Math.max(...statistics.map((d) => d.value));
    const intensity = value / maxUsers;
    return `rgb(${baseColor.map((c) => Math.round(c * intensity)).join(", ")})`;
  };

  const getMoroccoStats = () => {
    const moroccoData =
      statistics.find((c) => c.country.toLowerCase() === "ma")?.value || 0;
    const saharaData =
      statistics.find((c) => c.country.toLowerCase() === "eh")?.value || 0;
    const totalValue = moroccoData + saharaData;
    return {
      value: totalValue,
      color: getColorScale(moroccoData),
    };
  };

  return (
    <div className="relative h-[450px] w-full overflow-hidden rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <h5 className="text-xl font-semibold text-black dark:text-white">
          World map
        </h5>
      </div>

      {tooltip.show && (
        <div
          className="bg-gray-800 pointer-events-none fixed z-10 rounded px-2 py-1 text-sm font-semibold text-black"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translate(-50%, -120%)",
          }}
        >
          {tooltip.content}
        </div>
      )}

      <ComposableMap
        projectionConfig={{
          scale: 200,
          center: [0, 0],
        }}
        className="h-full w-full"
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const countryCode = NAME_TO_COUNTRY[countryName];

                const isMoroccoRegion =
                  countryName === "Morocco" || countryName === "W. Sahara";
                let moroccoStats;
                let value;
                let displayName;
                let fillColor;

                if (isMoroccoRegion) {
                  moroccoStats = getMoroccoStats();
                  value = moroccoStats.value;
                  displayName = "Morocco";
                  fillColor = moroccoStats.color;
                } else {
                  const countryData = statistics.find(
                    (c) =>
                      c.country.toLowerCase() === countryCode?.toLowerCase(),
                  );
                  value = countryData?.value || 0;
                  displayName = countryName;
                  fillColor = getColorScale(value);
                }

                const isHovered = isMoroccoRegion
                  ? hoveredRegion === "Morocco"
                  : hoveredRegion === countryName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className="outline-none transition-colors duration-200"
                    onMouseEnter={(evt) => {
                      setHoveredRegion(
                        isMoroccoRegion ? "Morocco" : countryName,
                      );
                      setTooltip({
                        content:
                          value > 0
                            ? `${displayName} (${value} ${value > 1 ? "users" : "user"})`
                            : displayName,
                        x: evt.pageX,
                        y: evt.pageY,
                        show: true,
                      });
                    }}
                    onMouseMove={(evt) => {
                      setTooltip((prev) => ({
                        ...prev,
                        x: evt.pageX,
                        y: evt.pageY,
                      }));
                    }}
                    onMouseLeave={() => {
                      setHoveredRegion(null);
                      setTooltip((prev) => ({ ...prev, show: false }));
                    }}
                    style={{
                      default: {
                        fill: isHovered ? "#d1d5db" : fillColor,
                        stroke: isMoroccoRegion ? "transparent" : "#fff",
                        strokeWidth: isMoroccoRegion ? 0 : 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: "#d1d5db",
                        stroke: isMoroccoRegion ? "transparent" : "#fff",
                        strokeWidth: isMoroccoRegion ? 0 : 0.5,
                        outline: "none",
                      },
                      pressed: {
                        fill: "#9ca3af",
                        stroke: isMoroccoRegion ? "transparent" : "#fff",
                        strokeWidth: isMoroccoRegion ? 0 : 0.5,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default WorldMap;
