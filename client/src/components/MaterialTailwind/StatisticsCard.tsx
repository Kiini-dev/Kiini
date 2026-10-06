import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatisticsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  color?: "blue" | "green" | "red" | "orange" | "purple" | "pink";
}

const colorClasses = {
  blue: "bg-gradient-to-br from-blue-500 to-blue-600",
  green: "bg-gradient-to-br from-green-500 to-green-600",
  red: "bg-gradient-to-br from-red-500 to-red-600",
  orange: "bg-gradient-to-br from-orange-500 to-orange-600",
  purple: "bg-gradient-to-br from-purple-500 to-purple-600",
  pink: "bg-gradient-to-br from-pink-500 to-pink-600",
};

export function StatisticsCard({
  icon,
  title,
  value,
  change,
  changeLabel = "from last month",
  color = "blue",
}: StatisticsCardProps) {
  const isPositive = change && change > 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={cn("p-3 rounded-lg text-white", colorClasses[color])}>
          {icon}
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {isPositive ? "+" : ""}{change}%
          </span>
          <span className="text-slate-600">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

