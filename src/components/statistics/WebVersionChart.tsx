"use client";

import API from "@/utils/API";
import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

interface VersionStatistic {
  _id: string;
  userCount: number;
}

const WebVersionChart: React.FC = () => {
  const chartColors = ["#2196F3", "#FFC107", "#E91E63", "#9C27B0"];
  const [statistics, setStatistics] = useState<VersionStatistic[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get("/api/v2/stats/webview");

        setStatistics(response.data.statistics);
        setTotalUsers(response.data.totalUsers);
      } catch (error) {
        console.error("Error fetching version statistics:", error);
      }
    };

    fetchData();
  }, []);

  const series = statistics.map((stat) => stat.userCount);
  const labels = statistics.map((stat) => `v${stat._id}`);
  const percentages = statistics.map((stat) =>
    ((stat.userCount / totalUsers) * 100).toFixed(1),
  );

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
    },
    colors: ["#2196F3", "#FFC107", "#E91E63", "#9C27B0"],
    labels: labels,
    legend: {
      show: false,
      position: "bottom",
    },

    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <h5 className="text-xl font-semibold text-black dark:text-white">
          Webview Analytics
        </h5>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="donut" />
        </div>
      </div>

      <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
        {statistics.map((stat, index) => (
          <div key={stat._id} className="w-full px-8">
            <div className="flex w-full items-center">
              <span
                className="mr-2 block h-3 w-full max-w-3 rounded-full"
                style={{
                  backgroundColor: chartColors[index % chartColors.length],
                }}
              ></span>
              <p className="flex items-center gap-2 w-full justify-between text-sm font-medium text-black dark:text-white">
                <span>v{stat._id}</span>
                <span>{percentages[index]}%</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebVersionChart;
