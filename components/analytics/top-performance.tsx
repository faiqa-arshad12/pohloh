import type {LucideIcon} from "lucide-react";
import type {ReactNode} from "react";

interface TopPerformanceProps {
  title: string;
  subtitle: string;
  percentage: string;
  icon?: LucideIcon;
  customIcon?: ReactNode;
  iconSize?: number;
}

const TopPerformance = ({
  title,
  subtitle,
  percentage,
  icon: Icon,
  customIcon,
  iconSize = 40,
}: TopPerformanceProps) => {
  return (
    <div className="bg-[#191919] p-6 rounded-[12px] text-white shadow-md w-full">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-urbanist font-bold text-[16px] leading-[140%] tracking-[0.01em] text-white">
              {title}
            </h4>
          </div>
          <div className="mt-2">
            <h5 className="text-[#F9DB6F] font-urbanist font-normal text-[20px] leading-[120%] tracking-[0] mb-1">
              {subtitle}
            </h5>
            <div className="text-[#F9DB6F] font-urbanist font-bold text-[48px] leading-[140%] tracking-[1%]">
              {percentage}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-full w-[80px] h-[80px] flex items-center justify-center">
          {customIcon ? (
            customIcon
          ) : Icon ? (
            <Icon size={iconSize} className="text-[#F9DB6F]" />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TopPerformance;
