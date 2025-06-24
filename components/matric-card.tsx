import React from "react";
import {Skeleton} from "./ui/skeleton";

interface MetricCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  className?: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  icon,
  className = "",
  loading,
}) => {
  return (
    <div className={`bg-[#191919] rounded-[20px] p-4 text-white ${className}`}>
      <div className="flex items-center gap-8 py-4">
        {loading ? (
          <div className="flex items-center gap-8 w-full">
            <Skeleton className="h-[48px] w-[48px] rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-[40px] w-[120px]" />
              <Skeleton className="h-[24px] w-[80px]" />
            </div>
          </div>
        ) : (
          <>
            <div className="text-yellow-400">{icon}</div>
            <div className="text-left">
              <span className="font-urbanist font-medium text-[34px] leading-[40px] tracking-[0] align-bottom">
                {value}
              </span>

              <p className="!font-urbanist text-[#FFFFFFCC] font-medium text-[20px] leading-[24px]">
                {label}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
