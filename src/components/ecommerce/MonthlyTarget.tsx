"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";
import { Skeleton } from "../ui/skeleton";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface MonthlyTargetProps {
  tierName: string;
  referralCount: number;
  activeInvestments: number;
  loading: boolean;
}

export default function MonthlyTarget({
  tierName,
  referralCount,
  activeInvestments,
  loading,
}: MonthlyTargetProps) {
  const series = [Math.min((referralCount / 10) * 100, 100)]; // Example: 10 referrals = 100%
  const [isOpen, setIsOpen] = useState(false);

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return `${val.toFixed(0)}%`;
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Target
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              Your current tier and progress this month
            </p>
          </div>
          <div className="relative inline-block">
            <button onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
              <DropdownItem onItemClick={closeDropdown}>View More</DropdownItem>
              <DropdownItem onItemClick={closeDropdown}>Delete</DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]">
            {loading ? (
              <Skeleton className="w-full h-[330px] rounded-full" />
            ) : (
              <ReactApexChart options={options} series={series} type="radialBar" height={330} />
            )}
          </div>
          {!loading && (
            <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
              +10%
            </span>
          )}
        </div>


        {loading ? (
          <Skeleton className="w-2/3 h-4 mx-auto" />
        ) : (
          <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
            You are currently in the ${tierName} tier with ${referralCount} referrals.
          </p>
        )}

      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Tier
          </p>
          {loading ? <Skeleton className="h-5 w-20 mx-auto" /> :
            <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {tierName}
            </p>}
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Referrals
          </p>
          {loading ? <Skeleton className="h-5 w-10 mx-auto" /> :
            <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {referralCount}
            </p>}
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Active Investments
          </p>
          {loading ? <Skeleton className="h-5 w-10 mx-auto" /> :
            <p className="text-center text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {activeInvestments}
            </p>}
        </div>
      </div>
    </div>
  );
}
