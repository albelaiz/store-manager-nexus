
import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
}) => {
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {trend && (
        <div className="mt-2 flex items-center">
          <span
            className={cn(
              "inline-flex items-center text-xs font-medium",
              trend === "up" && "text-store-success",
              trend === "down" && "text-store-danger",
              trend === "neutral" && "text-gray-500"
            )}
          >
            {trend === "up" && (
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 15l7-7 7 7"></path>
              </svg>
            )}
            {trend === "down" && (
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7"></path>
              </svg>
            )}
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
