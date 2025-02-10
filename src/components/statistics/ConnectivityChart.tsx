"use client";

import API from "@/utils/API";
import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

interface VersionStatistic {
  connection: string;
  value: number;
}

const ConnectivityChart: React.FC = () => {
  const [statistics, setStatistics] = useState<VersionStatistic[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get("/api/v2/stats/connection");

        setStatistics(response.data.statistics);
        setTotalUsers(response.data.totalUsers);
      } catch (error) {
        console.error("Error fetching version statistics:", error);
      }
    };

    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "40%",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + (Number(val) > 1 ? " users" : " user");
      },      
      style: {
        fontSize: "14px",
        fontFamily: "Satoshi, sans-serif",
      },
    },
    colors: ["#3C50E0", "#6577F3", "#8FD0EF", "#0FADCF"],
    xaxis: {
      categories: statistics.map((stat) => stat.connection || "Unknown"),
      labels: {
        style: {
          fontSize: "14px",
          fontFamily: "Satoshi, sans-serif",
        },
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: "Users",
      data: statistics.map((stat) => stat.value),
    },
  ];

  return (
    <div className="h-[450px] rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="mb-3">
        <h5 className="text-xl font-semibold text-black dark:text-white">
          Connection Type Analytics
        </h5>
      </div>
      <div className="mt-8">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={300}
        />
      </div>
    </div>
  );
};

export default ConnectivityChart;
