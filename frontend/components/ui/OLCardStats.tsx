"use client";

import React from "react";
import clsx from "clsx";

interface OLCardStatsProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "default" | "success" | "warning" | "danger" | "info";
}

/**
 * Card de estatísticas OL Tecnologia
 * Usado em dashboards (Colaboradores, OKRs, PDIs etc.)
 */
export default function OLCardStats({
  label,
  value,
  icon,
  color = "default",
}: OLCardStatsProps) {
  const colorMap: Record<string, string> = {
    default: "text-ol-text dark:text-darkOl-text",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
    info: "text-blue-600",
  };

  return (
    <div className="bg-ol-cardBg dark:bg-darkOl-cardBg border border-ol-border dark:border-darkOl-border rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">{label}</p>
          <p className={clsx("text-3xl font-bold mt-1", colorMap[color])}>{value}</p>
        </div>
        {icon && <div className={clsx("w-12 h-12", colorMap[color])}>{icon}</div>}
      </div>
    </div>
  );
}
